import 'reflect-metadata';
import { Connection, getConnection, createConnection } from 'typeorm';
import { User, UserAuth, Article, Comment, Tag } from './entity/index';
const host = process.env.DATABASE_HOST;
const port = Number(process.env.DATABASE_PORT);
const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;

let connection: Connection | null = null;
const randomNumber = Math.random();

export const getRandomNumber = () => {
  return randomNumber;
};

export const prepareConnection = async () => {
 
  console.log(`connection ${connection}`);
  console.log(`connection.isConnected ${connection?.isConnected}`);
  console.log(`moduleIdentifier ${randomNumber}`);
  if (!connection) {
    try {
      const staleConnection = getConnection();
      if(staleConnection){
        await staleConnection.close();
      }
    } catch (error) {
      console.log(error);
    }

    const newOne: Connection = await createConnection({
      type: 'mysql',
      host,
      port,
      username,
      password,
      database,
      entities: [User, UserAuth, Article, Comment, Tag],
      synchronize: false,
      logging: true,

    });
    connection = newOne;
    return connection;
  }

  if (!connection.isConnected) {
    connection = await connection.connect()
    console.log(`connection.isConnected ${connection.isConnected}`);
    return connection;
  }
  return connection;
};

// let connectionReadyPromise: Promise<Connection> | null = null;
// export const prepareConnection = () => {
//   if (!connectionReadyPromise) {
//     connectionReadyPromise = (async () => {
//       try {
//         const staleConnection = getConnection();
//         await staleConnection.close();
//       } catch (error) {
//         console.log(error);
//       }

//       const connection = await createConnection({
//         type: 'mysql',
//         host,
//         port,
//         username,
//         password,
//         database,
//         entities: [User, UserAuth, Article, Comment, Tag],
//         synchronize: false,
//         logging: true,
//       });

//       return connection;
//     })();
//   }

//   return connectionReadyPromise;
// };