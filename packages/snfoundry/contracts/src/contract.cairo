use starknet::ContractAddress;

#[starknet::interface]
pub trait ITarot<TContractState> {
    fn draw_card(self: @TContractState) -> ByteArray;
    fn mint(ref self: TContractState, token_uri: ByteArray);
}

#[starknet::contract]
pub mod Tarot {
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl, 
        interface::{IERC721Metadata, IERC721MetadataCamelOnly}, 
        // extensions::ERC721EnumerableComponent
    };

    use starknet::{
        ContractAddress, contract_address_const, get_block_number, get_caller_address, get_contract_address, get_block_timestamp
    };
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Vec, VecTrait, MutableVecTrait, Map
    };

    use openzeppelin::access::ownable::OwnableComponent;

    // use art3mis::helper::{convert1, convert2, convert3};

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    // component!(path: ERC721EnumerableComponent, storage: enumerable, event: EnumerableEvent);

    // // ERC721 
    #[abi(embed_v0)]
    impl ERC721Impl = ERC721Component::ERC721Impl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;
    // #[abi(embed_v0)]
    // impl ERC721EnumerableImpl =
    //     ERC721EnumerableComponent::ERC721EnumerableImpl<ContractState>;
    #[abi(embed_v0)]
    impl ERC721CamelOnlyImpl = ERC721Component::ERC721CamelOnlyImpl<ContractState>;

    // // Ownable 
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OWnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        cards: Vec<ByteArray>,
        minted: u256,
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        // Mapping for token URIs
        token_uris: Map<u256, ByteArray>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event
    }


    #[constructor]
    fn constructor(
        ref self: ContractState,
    ) {
        self.cards.append().write("0 The Fool");
        self.cards.append().write("I The Magician");
        self.cards.append().write("II The High Priestess");
        self.cards.append().write("III The Empress");
        self.cards.append().write("IV The Emperor");
        self.cards.append().write("V The Hierophant");
        self.cards.append().write("VI The Lovers");
        self.cards.append().write("VII The Chariot");
        self.cards.append().write("VIII Strength");
        self.cards.append().write("IX The Hermit");
        self.cards.append().write("X The Wheel of Fortune");
        self.cards.append().write("XI Justice");
        self.cards.append().write("XII The Hanged Man");
        self.cards.append().write("XIII Death");
        self.cards.append().write("XIV Temperance");
        self.cards.append().write("XV The Devil");
        self.cards.append().write("XVI The Tower");
        self.cards.append().write("XVII The Star");
        self.cards.append().write("XVIII The Moon");
        self.cards.append().write("XIX The Sun");
        self.cards.append().write("XX Judgement");
        self.cards.append().write("XXI The World");
        self.minted.write(0);
        let name: ByteArray = "Art3misOracle";
        let symbol: ByteArray = "AT";
        let base_uri: ByteArray = "ipfs://bafybeiel3ftyc3pkjfnb5dseioeuoewr5xqqpxqyb2737e4shfkvnbrkuy/";

        self.erc721.initializer(name, symbol, base_uri);
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        // token_uri custom implementation
        fn _token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            assert(self.erc721.exists(token_id), ERC721Component::Errors::INVALID_TOKEN_ID);
            let base_uri = self.erc721._base_uri();
            if base_uri.len() == 0 {
                Default::default()
            } else {
                let uri = self.token_uris.read(token_id);
                format!("{}{}", base_uri, uri)
            }
        }
        // ERC721URIStorage internal functions,
        fn set_token_uri(ref self: ContractState, token_id: u256, uri: ByteArray) {
            assert(self.erc721.exists(token_id), ERC721Component::Errors::INVALID_TOKEN_ID);
            self.token_uris.write(token_id, uri);
        }
    }

    #[abi(embed_v0)]
    impl WrappedIERC721MetadataImpl of IERC721Metadata<ContractState> {
        // Override token_uri to use the internal ERC721URIStorage _token_uri function
        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            self._token_uri(token_id)
        }
        fn name(self: @ContractState) -> ByteArray {
            self.erc721.name()
        }
        fn symbol(self: @ContractState) -> ByteArray {
            self.erc721.symbol()
        }
    }

    #[abi(embed_v0)]
    impl WrappedIERC721MetadataCamelOnlyImpl of IERC721MetadataCamelOnly<ContractState> {
        // Override tokenURI to use the internal ERC721URIStorage _token_uri function
        fn tokenURI(self: @ContractState, tokenId: u256) -> ByteArray {
            self._token_uri(tokenId)
        }
    }

    #[abi(embed_v0)]
    impl TarotImpl of super::ITarot<ContractState> {

        fn draw_card(self: @ContractState) -> ByteArray {
            let index1: u64 = get_block_timestamp() %  21;
            let index2: u64 = get_block_timestamp() %  1;
            let mut output: ByteArray = "";
            let mut card = self.cards.at(index1).read();
            output.append(@card);
            if(index2 == 1){ //upright
                output.append(@", upright");
            };
            output
        }

        fn mint(ref self: ContractState, token_uri: ByteArray){
            let token_id = self.minted.read();
            self.erc721.mint(get_caller_address(), token_id);
            self.set_token_uri(token_id, token_uri);
            self.minted.write(self.minted.read() + 1);
        }
    }

}