export const tracks = [
    {
        id: 't1',
        title: "Astronaut In The Ocean",
        artist: "Masked Wolf",
        duration: 210,
        genre: "Hip Hop",
        favorite: false,
        coverColor: "#1a1a1a",
        src: "music/Masked Wolf - Astronaut In The Ocean (Official Music Video).mp3"
    },
    {
        id: 't2',
        title: "Señorita",
        artist: "Shawn Mendes, Camila Cabello",
        duration: 191,
        genre: "Pop",
        favorite: true,
        coverColor: "#d63031",
        src: "music/Shawn%20Mendes%2C%20Camila%20Cabello%20-%20Se%C3%B1orita.mp3"
    }
];

// Helper to get consistent color for UI if needed
export function getTrackColor(index) {
    return tracks[index % tracks.length].coverColor;
}
