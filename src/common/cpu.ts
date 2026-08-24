let _cpu_speed = 0;

export const setCpuSpeed = (speed: number) => {
  _cpu_speed = speed;
};

export const getCpuSpeed = () => {
  return _cpu_speed;
};
