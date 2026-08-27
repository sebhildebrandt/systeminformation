import { DARWIN, FREEBSD, LINUX, NETBSD, OPENBSD, WINDIR, WINDOWS } from './const';
import { fileExists } from './files';

// any: one of the files is enough - all: every group needs a hit (driver AND runtime)
type LayerCandidate = { name: string; any?: string[]; all?: string[][] };

const join = (paths: string[], files: string[], separator: string) => {
  const result: string[] = [];
  paths.forEach((path) => {
    files.forEach((file) => {
      result.push(`${path}${separator}${file}`);
    });
  });
  return result;
};

const anyExists = async (files: string[]) => (await Promise.all(files.map((file) => fileExists(file)))).includes(true);

export const detectLayers = async (candidates: LayerCandidate[]) => {
  const detected = await Promise.all(
    candidates.map(async (candidate) => {
      if (candidate.all) {
        const groups = await Promise.all(candidate.all.map((group) => anyExists(group)));
        return !groups.includes(false) ? candidate.name : '';
      }
      return candidate.any && (await anyExists(candidate.any)) ? candidate.name : '';
    })
  );
  return detected.filter(Boolean);
};

const envPaths = (value?: string, separator = ':') => (value || '').split(separator).filter(Boolean);

const linuxCandidates = (): LayerCandidate[] => {
  const paths = [
    ...envPaths(process.env.LD_LIBRARY_PATH),
    '/usr/lib',
    '/usr/lib64',
    '/lib',
    '/usr/lib/x86_64-linux-gnu',
    '/usr/lib/aarch64-linux-gnu',
    '/usr/local/lib',
    '/usr/local/cuda/lib64',
    '/opt/rocm/lib',
    '/opt/intel/oneapi/lib'
  ];
  const lib = (files: string[]) => join(paths, files, '/');
  return [
    { name: 'cuda', all: [lib(['libnvidia-ml.so', 'libnvidia-ml.so.1']), lib(['libcudart.so', 'libcudart.so.11', 'libcudart.so.12', 'libcudart.so.13'])] },
    { name: 'rocm', any: lib(['libamdhip64.so', 'librocm_smi64.so']) },
    { name: 'oneapi', any: lib(['libze_loader.so', 'libze_loader.so.1']) },
    { name: 'vulkan', any: lib(['libvulkan.so', 'libvulkan.so.1']) },
    { name: 'opencl', any: lib(['libOpenCL.so', 'libOpenCL.so.1']) }
  ];
};

const windowsCandidates = (): LayerCandidate[] => {
  const system = [`${WINDIR}\\System32`, `${WINDIR}\\SysWOW64`];
  const cudaPath = process.env.CUDA_PATH ? [`${process.env.CUDA_PATH}\\bin`] : [];
  // only vendor directories - keeps the number of checks small on long PATHs
  const vendorPaths = envPaths(process.env.PATH, ';').filter((path) => /cuda|nvidia|vulkan|oneapi/i.test(path));
  const paths = [...system, ...cudaPath, ...vendorPaths];
  const lib = (files: string[]) => join(paths, files, '\\');
  return [
    { name: 'cuda', all: [lib(['nvml.dll']), lib(['cudart64_11.dll', 'cudart64_12.dll', 'cudart64_13.dll'])] },
    { name: 'oneapi', any: lib(['ze_loader.dll']) },
    { name: 'vulkan', any: lib(['vulkan-1.dll']) },
    { name: 'opencl', any: lib(['OpenCL.dll']) },
    { name: 'dx12', any: join(system, ['d3d12.dll'], '\\') },
    { name: 'directml', any: join(system, ['DirectML.dll'], '\\') }
  ];
};

const darwinCandidates = (): LayerCandidate[] => {
  const paths = ['/usr/lib', '/usr/local/lib', '/opt/homebrew/lib'];
  const lib = (files: string[]) => join(paths, files, '/');
  return [
    { name: 'metal', any: ['/System/Library/Frameworks/Metal.framework'] },
    { name: 'vulkan', any: lib(['libvulkan.dylib', 'libvulkan.1.dylib', 'libMoltenVK.dylib']) },
    { name: 'opencl', any: ['/System/Library/Frameworks/OpenCL.framework', ...lib(['libOpenCL.dylib'])] }
  ];
};

// available compute layers, detected by the presence of their runtime libraries
export const hwAcceleration = async (): Promise<string[]> => {
  switch (true) {
    case LINUX || FREEBSD || NETBSD || OPENBSD:
      return detectLayers(linuxCandidates());
    case DARWIN:
      return detectLayers(darwinCandidates());
    case WINDOWS:
      return detectLayers(windowsCandidates());
    default:
      return [];
  }
};
