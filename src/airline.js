import AirlineContract from "../build/contracts/Airline.json";
import contract from "truffle-contract";

export default async(provider) => {
    /*Creamos un nuevo contrato con el Json que genera la compilacion de truffle compile */
    const airline = contract(AirlineContract);
    /*Agregamos el provider, en este caso MetaMask */
    airline.setProvider(provider);

    /*Creamos la intancia y la devolvemos */
    let instance = await airline.deployed();
    return instance;
};