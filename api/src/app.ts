import express, { Application } from "express";
// import morgan from "morgan";
// import swaggerUi from "swagger-ui-express";

import { RegisterRoutes } from "./routes/index"; // tsoa va générer ce fichier
import { errorHandler } from "./middlewares/errorHandler";
import { AppDataSource } from "./config/datasource";

const PORT = process.env.PORT || 8000;

const app: Application = express();

app.use(express.json());
app.use(express.static("public"));
// app.use(
//   "/docs",
//   swaggerUi.serve,
//   swaggerUi.setup(undefined, {
//     swaggerOptions: {
//       url: "/swagger.json",
//     },
//   })
// );
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
      console.log("Server is running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

RegisterRoutes(app);

app.use(errorHandler);
