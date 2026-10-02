export type UploadedSong =
    | {
    id: string;
    title: string;
    format: "txt";
    source: string;
}
    | {
    id: string;
    title: string;
    format: "midi";
    source: ArrayBuffer;
};