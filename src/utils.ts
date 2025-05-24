


export const random = (len: number) => {
    const options: string = "ejhdsmvbdfkhdfjfaqrk";
    let length: number = options.length;

    let randomText: string = "";

    for(let i = 0; i<len; i++){
        randomText += options[Math.floor(Math.random() * length)] // 0 => 20
    }
    return randomText;
}