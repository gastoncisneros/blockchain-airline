import React, { Component } from "react";
import Panel from "./Panel";
import getWeb3 from './getWeb3';
import AirlineContract from './airline';
import { AirlineService } from "./airlineService";
import { ToastContainer } from "react-toastr";

/*Recibe nuestra instancia de Web3 y devuelve una funcion que recibe un valor */
/*La funcion que retorna, recibe un valor y lo convierte a ether */
const converter = (web3) => {
    return (value) => {
        return web3.utils.fromWei(value.toString(), 'ether');
    }
}

export class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            account : undefined,
            balance: 0,
            flights: [],
            customerFlights: [],
            refundableEther: 0
        };
    }

    /*Cuando se ingresa al componente */
    async componentDidMount(){
        this.web3 = await getWeb3();
        this.toEther = converter(this.web3);
        this.airline = await AirlineContract(this.web3.currentProvider);/*La instancia del contrato */
        this.airlineService = new AirlineService(this.airline);/*El Service para interactuar con el contrato */

        var account = (await this.web3.eth.getAccounts())[0];

        /*Almacenamos la invocacion al evento FlightPurchased del Smart Contract */
        let flightPurchased = this.airline.FlightPurchased();
        flightPurchased.watch((err, result) =>  { /*Nos permite suscribirnos al evento de la compra de un vuelo */

            const{customer, price, flight} = result.args;

            if(customer === this.state.account) {
                console.log(`You purchased a flight to ${flight} with a cost of ${price}`);
            }else{
                this.container.success(`Last customer purchased a flight to ${flight}
                with a cost of ${price}`, 'Flight information');
            }

        });


        /*Nos permite registrarnos a diferentes eventos */
        this.web3.currentProvider.on('accountsChanged', (accounts) => {
            this.setState({
                account: accounts[0].toLowerCase()
            }, () => {
                this.load();
            });
        });


        this.setState({
            account: account.toLowerCase()
        }, () => {
            this.load();
        });
    }

    async getBalance(){
        let weiBalance = await this.web3.eth.getBalance(this.state.account);
        this.setState({
            balance: this.toEther(weiBalance)
        });
    }

    async getFlights(){
        let flights = await this.airlineService.getFlights();

        this.setState({
            flights: flights
        });
    }

    async getRefundableEther(){
        let refundableEther = this.toEther(await this.airlineService.getRefundableEther(this.state.account));

        this.setState({
            refundableEther: refundableEther
        })
    }

    async refundLoyaltyPoints(){
        await this.airlineService.redeemLoyaltyPoints(this.state.account);

        await this.load();
    }

    async getCustomerFlights(){        
        let customerFlights = await this.airlineService.getCustomerFlights(this.state.account);

        this.setState({
            customerFlights: customerFlights
        });
    }

    async buyFlight(flightIndex, flight){
        await this.airlineService.buyFlight(
            flightIndex, 
            this.state.account, 
            flight.price
        );

        await this.load();
    }

    async load(){
        this.getBalance();
        this.getFlights();
        this.getCustomerFlights();
        this.getRefundableEther();
    }

    render() {
        return <React.Fragment>
            <div className="jumbotron">
                <h4 className="display-4">Welcome to the Airline!</h4>
            </div>

            <div className="row">
                <div className="col-sm">
                    <Panel title="Balance">
                        <p><strong>{this.state.account}</strong></p>
                        <span><strong>Balance: </strong>{this.state.balance}</span>
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Loyalty points - refundable ether">
                        <span>{this.state.refundableEther} eth</span>
                        <button className="btn btn-sm btn-success text-white"
                        onClick={() => this.refundLoyaltyPoints()}>Refund</button>
                    </Panel>
                </div>
            </div>
            <div className="row">
                <div className="col-sm">
                    <Panel title="Available flights">
                        {this.state.flights.map((flight, i) => {
                            return <div key={i}>
                                <span>{flight.name} - cost: {this.toEther(flight.price)}</span>
                                <button className="btn btn-sm btn-success text-white" onClick={() => this.buyFlight(i, flight)}>Purchase</button>
                            </div>
                        })}
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Your flights">
                        {this.state.customerFlights.map((flight, i) => {
                            return <div key={i}>
                                <span>{flight.name} - cost: {this.toEther(flight.price)}</span>
                            </div>
                        })}
                    </Panel>
                </div>
            </div>
            <ToastContainer ref={(input) => this.container = input}
            className="toast-top-right"/>
        </React.Fragment>
    }
}