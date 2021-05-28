import Web3 from 'web3';

/*Hacecmos esto porque Metamask inyecta la version 0.20.7 de web 3, y queremos usar la 1.0.0 que nosotros instalamos */
const getWeb3 = () => {
    return new Promise((resolve, reject) => {
        window.addEventListener('load', function() {
            let web3 = window.web3;

            if(typeof web3 != undefined){
                web3 = new Web3(web3.currentProvider);
                resolve(web3);
            }else{
                console.error("No provider found, please install Metamask");
                reject();
            }
        });
    });
};

export default getWeb3;