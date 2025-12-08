export const random = (len: number): string => {
  const options: string =
    "ejhdsmvbdfkhdfjfaqrkcfh+ghjtyhikjuyio2368695356783457890";
  let length: number = options.length;

  let randomText: string = "";

  for (let i = 0; i < len; i++) {
    randomText += options[Math.floor(Math.random() * length)]; // 0 => 20
  }
  return randomText;
};
