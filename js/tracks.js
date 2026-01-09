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
        src: "music/Shawn Mendes, Camila Cabello - Señorita.mp3"
    },
    {
        id: 't3',
        title: "Poison",
        artist: "Meg Myers",
        duration: 220,
        genre: "Alternative",
        favorite: true,
        coverColor: "#6c5ce7"
    },
    {
        id: 't2',
        title: "I Want It All",
        artist: "Cameron Grey",
        duration: 199,
        genre: "Hip Hop",
        favorite: false,
        coverColor: "#fdcb6e"
    },
    {
        id: 't3',
        title: "Electric Dreams",
        artist: "Synthwave Pro",
        duration: 221,
        genre: "Electronic",
        favorite: true,
        coverColor: "#0984e3"
    },
    {
        id: 't4',
        title: "Summer Vibes",
        artist: "Neon Beach",
        duration: 207,
        genre: "Pop",
        favorite: false,
        coverColor: "#e17055"
    },
    {
        id: 't5',
        title: "Night Drive",
        artist: "The Midnight",
        duration: 255,
        genre: "Synthwave",
        favorite: true,
        coverColor: "#636e72"
    },
    {
        id: 't6',
        title: "Lo-Fi Study Beat",
        artist: "Chill Hopper",
        duration: 184,
        genre: "Lo-Fi",
        favorite: false,
        coverColor: "#a29bfe"
    },
    {
        id: 't7',
        title: "Jazz Cafe",
        artist: "Smooth Trio",
        duration: 245,
        genre: "Jazz",
        favorite: false,
        coverColor: "#fd79a8"
    },
    {
        id: 't8',
        title: "Heavy Metal Thunder",
        artist: "Iron Forge",
        duration: 230,
        genre: "Metal",
        favorite: false,
        coverColor: "#2d3436"
    },
    {
        id: 't9',
        title: "Acoustic Morning",
        artist: "Jane Doe",
        duration: 195,
        genre: "Acoustic",
        favorite: true,
        coverColor: "#00b894"
    },
    {
        id: 't10',
        title: "Techno Bunker",
        artist: "DJ Dark",
        duration: 310,
        genre: "Techno",
        favorite: false,
        coverColor: "#d63031"
    }
];

// Helper to get consistent color for UI if needed
export function getTrackColor(index) {
    return tracks[index % tracks.length].coverColor;
}
