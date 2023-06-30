// Importing required modules and libraries
const express = require("express"); // Express framework for creating the server
const { open } = require("sqlite"); // SQLite library for database operations
const sqlite3 = require("sqlite3"); // SQLite3 driver
const path = require("path"); // Path module for handling file paths

// Setting up server configurations
const port = 3000; // Port number for the server
const app = express(); // Creating an instance of the Express application
app.use(express.json()); // Allowing the application to parse JSON data
let db = null; // Initializing the database connection variable
const filePath = path.join(__dirname, "./moviesData.db"); // File path for the SQLite database

// Function to connect the server with the database
const connectServerWithDb = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`Server Started`);
    });
  } catch (error) {
    console.log(`Connection Error : ${error.message}`);
  }
};
connectServerWithDb();

// Function to transform movie object keys
const movieKeyChange = (movieObj) => {
  return {
    movieId: movieObj.movie_id,
    directorId: movieObj.director_id,
    movieName: movieObj.movie_name,
    leadActor: movieObj.lead_actor,
  };
};

// Function to transform single movie object keys
const singleMovie = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};

// Function to transform director object keys
const directorsKeyChange = (directorObj) => {
  return {
    directorId: directorObj.director_id,
    directorName: directorObj.director_name,
  };
};

// Endpoint to get all movies
app.get("/movies/", async (req, res) => {
  let getAllMoviesQuery = `SELECT movie_name FROM movie `;
  let dbResponse = await db.all(getAllMoviesQuery);
  res.send(dbResponse.map((el) => singleMovie(el)));
});

// Endpoint to add a new movie
app.post("/movies", async (req, res) => {
  let addNewMovie = req.body;
  let { directorId, movieName, leadActor } = addNewMovie;
  let addMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES('${directorId}','${movieName}','${leadActor}')`;
  let dbResponse = await db.run(addMovieQuery);
  res.send(`Movie Successfully Added`);
});

// Endpoint to get a single movie by movieId
app.get("/movies/:movieId", async (req, res) => {
  let { movieId } = req.params;
  let movieIdQuery = `SELECT * FROM movie WHERE movie_id ='${movieId}'`;
  let dbResponse = await db.get(movieIdQuery);
  res.send(movieKeyChange(dbResponse));
});

// Endpoint to update a movie by movieId
app.put("/movies/:movieId", async (req, res) => {
  let { movieId } = req.params;
  let updateMovieData = req.body;
  let { directorId, movieName, leadActor } = updateMovieData;
  let updateMovieQuery = `UPDATE movie SET director_id = '${directorId}',movie_name = '${movieName}', lead_actor = '${leadActor}' WHERE movie_id = '${movieId}'`;
  let dbResponse = await db.run(updateMovieQuery);
  res.send(`Movie Details Updated`);
});

// Endpoint to delete a movie by movieId
app.delete("/movies/:movieId", async (req, res) => {
  let { movieId } = req.params;
  let deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  let dbResponse = db.run(deleteQuery);
  res.send(`Movie Removed`);
});

// Endpoint to get all directors
app.get("/directors/", async (req, res) => {
  let getAllDirectors = `SELECT director_id, director_name FROM director`;
  let dbResponse = await db.all(getAllDirectors);
  res.send(dbResponse.map((el) => directorsKeyChange(el)));
});

// Endpoint to get movies by directorId
app.get("/directors/:directorId/movies/", async (req, res) => {
  let { directorId } = req.params;
  let directorEachMovieQuery = `SELECT movie_name FROM movie where director_id = '${directorId}'`;
  let dbResponse = await db.all(directorEachMovieQuery);
  res.send(dbResponse.map((el) => movieKeyChange(el)));
});

module.exports = app;
