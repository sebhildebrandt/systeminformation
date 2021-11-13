import { nextTick } from '../../common';
import { powerShell } from '../../common/exec';

type RegExpMatchArrayWithGroups<T> = {
  groups?: {
    [key in keyof T]: string;
  }
} | null;

interface Property {
  Name: string;
  Value: unknown;
}

interface WindowsBIOS {
  Properties: Property[];
  Manufacturer: string;
  Version: string;
  BuildNumber: string;
}

export const windowsBios = async () => {
  const data = await powerShell('Get-WmiObject Win32_bios | ConvertTo-Json -Depth 5').then(stdout => JSON.parse(stdout) as WindowsBIOS);
  const rawReleaseDate = data.Properties.find(property => property.Name === 'ReleaseDate')?.Value as string;
  const match = rawReleaseDate.match(/(?<year>19\d{2}|20\d{2})(?<month>\d{2})(?<day>\d{2})(?<hour>\d{2})(?<minute>\d{2})(?<second>\d{2})/) as RegExpMatchArrayWithGroups<{
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
  }>;

  const releaseDate = match && match.groups ? Date.parse(`${match.groups.day} ${match.groups.month} ${match.groups.year} ${match.groups.hour}:${match.groups.minute}:${match.groups.second} UTC`) : null;

  return {
    vendor: data.Manufacturer,
    version: data.Version,
    releaseDate: releaseDate ? new Date(releaseDate) : null,
    revision: data.BuildNumber
  };
};

export const bios = async () => {
  await nextTick();
  return windowsBios();
};
