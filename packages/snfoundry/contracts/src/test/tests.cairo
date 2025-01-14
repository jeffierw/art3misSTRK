
use snforge_std::{ declare, cheat_caller_address, CheatSpan, DeclareResultTrait, ContractClassTrait};
use starknet::{ ContractAddress, contract_address_const};

use art3mis::contract::ITarotDispatcher;
use art3mis::contract::ITarotDispatcherTrait;
use openzeppelin_testing::{declare_and_deploy};
use openzeppelin::token::erc721::interface::{
    IERC721Dispatcher, IERC721DispatcherTrait, IERC721MetadataDispatcher,
    IERC721MetadataDispatcherTrait
};


// fn setup_dispatcher() -> ITarotDispatcher {
//     let mut calldata = ArrayTrait::new();
    
//     let address = declare_and_deploy("Tarot", calldata); //mod name

//     start_cheat_caller_address(address, contract_address_const::<'OWNER'>());
//     ITarotDispatcher { contract_address: address}
// }

// Should deploy the contract
fn deploy_contract(name: ByteArray) -> ContractAddress {
    let contract = declare(name).unwrap().contract_class();
    let mut calldata = array![];
    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    println!("Contract deployed on: {:?}", contract_address);
    contract_address
}

fn OWNER() -> ContractAddress {
    contract_address_const::<'OWNER'>()
}

// #[test]
// fn test_dispatch() {
//     let dispatcher = setup_dispatcher();
// }

#[test]
fn test_deploy(){
    let your_contract_address = deploy_contract("Tarot");
    let your_dispatcher = ITarotDispatcher {
        contract_address: your_contract_address
    };
    let erc721 = IERC721Dispatcher { contract_address: your_contract_address };
    let erc721Metadata = IERC721MetadataDispatcher {
        contract_address: your_contract_address
    };
    let token_name = erc721Metadata.name();
    println!("Token Name: {:?}", token_name);
    let draw_results = your_dispatcher.draw_card();
    println!("Draw Results: {:?}", draw_results);
}