// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// signup function

document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    if(password.length<8){
        document.getElementById('sigin-error-message').textContent='password must be 8 characters long';
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "home.html";
    } catch (error) {
        document.getElementById('signin-error-message').textContent = 'Incorrect details. Please try again.';
        console.error('Error signing in:', error.message);
    }
});

// Sign in function
document.getElementById('signin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    if(password.length<8){
        document.getElementById('sigin-error-message').textContent='password must be 8 characters long';
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "home.html";
    } catch (error) {
        document.getElementById('signin-error-message').textContent = 'Incorrect details. Please try again.';
        console.error('Error signing in:', error.message);
    }
});

// Sign out function
document.getElementById('signout-btn')?.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        console.error('Error signing out:', error.message);
    }
});

// OMDB API search function
document.getElementById('search-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById('search-input').value;
    const apiKey = '42a86f62'; // Your OMDB API key
    const url = `https://www.omdbapi.com/?s=${searchTerm}&apikey=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const movieDetailsDiv = document.getElementById('movie-details');
        movieDetailsDiv.innerHTML = '';

        if (data.Search) {
            data.Search.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.innerHTML = `
                    <h2>${movie.Title}</h2>
                    <p><strong>Year:</strong> ${movie.Year}</p>
                    <p><strong>Type:</strong> ${movie.Type}</p>
                    <button class="add-to-list-btn" data-movie-id="${movie.imdbID}">Add to List</button>
                `;
                movieDetailsDiv.appendChild(movieItem);
            });

            // Add event listeners to the add-to-list buttons
            document.querySelectorAll('.add-to-list-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const movieId = e.target.getAttribute('data-movie-id');
                    await addToMovieList(movieId);
                });
            });
        } else {
            movieDetailsDiv.innerHTML = '<p>No movies found.</p>';
        }
    } catch (error) {
        console.error('Error searching movie:', error.message);
    }
});

// Function to add a movie to the list
const addToMovieList = async (movieId) => {
    const listType = prompt('Do you want to make this list public or private? (Enter "public" or "private")');

    if (listType === 'public' || listType === 'private') {
        const user = auth.currentUser;
        if (user) {
            const movieListRef = doc(db, 'users', user.uid, 'movieLists', movieId);
            await setDoc(movieListRef, {
                movieId: movieId,
                listType: listType
            });

            if (listType === 'public') {
                // Constructing public link
                const publicLink = `https://astonishing-snickerdoodle-ccfc7b.netlify.app/public-list.html?uid=${user.uid}`;
                document.getElementById('public-link').value = publicLink;
                document.getElementById('public-link-top').value = publicLink;
                document.getElementById('public-link-container').style.display = 'block';
                document.getElementById('public-link-container-top').style.display = 'block';
            } else {
                document.getElementById('public-link-container').style.display = 'none';
                document.getElementById('public-link-container-top').style.display = 'none';
            }

            alert('Movie added to your list.');
            await displayMovieInList(movieId, listType); // Add movie to the user's list on the home page
        } else {
            alert('User not signed in.');
        }
    } else {
        alert('Invalid list type. Please enter "public" or "private".');
    }
};

// Fetch movie details from OMDB API
const fetchMovieDetails = async (movieId) => {
    const apiKey = '42a86f62'; // Your OMDB API key
    const url = `https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching movie details:', error.message);
        return null;
    }
};

// Fetch and display movie details in the user's list
const displayMovieInList = async (movieId, listType) => {
    const movie = await fetchMovieDetails(movieId);
    if (!movie) return;

    const movieListContent = document.getElementById('user-movie-list-content') || document.getElementById('public-movie-list-content');
    const movieItem = document.createElement('div');
    movieItem.innerHTML = `
        <h2>${movie.Title}</h2>
        <p><strong>Year:</strong> ${movie.Year}</p>
        <p><strong>Rated:</strong> ${movie.Rated}</p>
        <p><strong>Plot:</strong> ${movie.Plot}</p>
        <p><strong>List Type:</strong> ${listType}</p>
    `;
    movieListContent.appendChild(movieItem);
};

// Copy Link Button functionality
const copyLink = (inputId) => {
    const publicLink = document.getElementById(inputId);
    publicLink.select();
    document.execCommand('copy');
    alert('Link copied to clipboard.');
};

document.getElementById('copy-link-btn')?.addEventListener('click', () => copyLink('public-link'));
document.getElementById('copy-link-btn-top')?.addEventListener('click', () => copyLink('public-link-top'));

// Load user's movie list
const loadUserMovieList = async () => {
    const user = auth.currentUser;
    if (user) {
        const movieListContent = document.getElementById('user-movie-list-content');
        movieListContent.innerHTML = '';

        const movieListSnapshot = await getDocs(collection(db, 'users', user.uid, 'movieLists'));
        movieListSnapshot.forEach(async (doc) => {
            const movieData = doc.data();
            if (movieData.listType === 'public' || movieData.listType === 'private') {
                await displayMovieInList(movieData.movieId, movieData.listType);
            }
        });
    } else {
        console.log('User not signed in.');
    }
};

if (window.location.pathname.includes('home.html')) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('signin-page').style.display = 'none';
            document.getElementById('home-page').style.display = 'block';
            loadUserMovieList();
        } else {
            document.getElementById('signin-page').style.display = 'block';
            document.getElementById('home-page').style.display = 'none';
        }
    });
}

// Fetch and display public movie list
const displayPublicMovieList = async () => {
    console.log("displayPublicMovieList function called"); // Debugging statement

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('uid');

    if (userId) {
        console.log(`Fetching public movies for user ID: ${userId}`); // Debugging statement
        const movieListContent = document.getElementById('public-movie-list-content');
        movieListContent.innerHTML = '';

        try {
            const movieListSnapshot = await getDocs(collection(db, 'users', userId, 'movieLists'));
            movieListSnapshot.forEach(async (doc) => {
                const movieData = doc.data();
                console.log(`Movie found: ${movieData.movieId} (listType: ${movieData.listType})`); // Debugging statement
                if (movieData.listType === 'public') {
                    await displayMovieInList(movieData.movieId, 'public');
                }
            });
        } catch (error) {
            console.error('Error fetching public movie list:', error.message);
        }
    } else {
        console.log('No user ID provided in URL.');
    }
};

if (window.location.pathname.includes('public-list.html')) {
    console.log("public-list.html detected"); // Debugging statement
    displayPublicMovieList();
}
