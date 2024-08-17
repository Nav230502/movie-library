import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getFirestore, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBFdk27fe7mTJv0dRYnhI_jMaPphRfnfLg",
    authDomain: "movie-library-8387d.firebaseapp.com",
    projectId: "movie-library-8387d",
    storageBucket: "movie-library-8387d.appspot.com",
    messagingSenderId: "292649050345",
    appId: "1:292649050345:web:0164a180c64a55da64d078",
    measurementId: "G-GX031DK549"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch movie details from OMDB API
const fetchMovieDetails = async (movieId) => {
    const apiKey = '42a86f62';
    const url = `https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie details:', error.message);
        return null;
    }
};

// Load public movie list
const loadPublicMovieList = async (uid) => {
    const movieListsRef = collection(db, 'users', uid, 'movieLists');
    const movieListsSnapshot = await getDocs(movieListsRef);

    const publicMovieListContent = document.getElementById('public-movie-list-content');
    publicMovieListContent.innerHTML = '';

    movieListsSnapshot.forEach(async (doc) => {
        const movieData = doc.data();
        if (movieData.listType === 'public') {
            const movieDetails = await fetchMovieDetails(movieData.movieId);
            if (movieDetails) {
                const movieItem = document.createElement('div');
                movieItem.innerHTML = `
                    <h2>${movieDetails.Title}</h2>
                    <p><strong>Year:</strong> ${movieDetails.Year}</p>
                    <p><strong>Rated:</strong> ${movieDetails.Rated}</p>
                    <p><strong>Plot:</strong> ${movieDetails.Plot}</p>
                `;
                publicMovieListContent.appendChild(movieItem);
            }
        }
    });
};

// Get UID from URL parameters and load public movie list
const urlParams = new URLSearchParams(window.location.search);
const uid = urlParams.get('uid');
if (uid) {
    loadPublicMovieList(uid);
}
