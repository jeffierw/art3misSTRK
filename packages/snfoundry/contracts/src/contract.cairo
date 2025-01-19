use starknet::ContractAddress;

#[starknet::interface]
pub trait ITarot<TContractState> {
    fn draw_card(self: @TContractState) -> ByteArray;
    fn mint(ref self: TContractState, recipient: ContractAddress, token_uri: ByteArray) -> u256;
}

#[starknet::contract]
pub mod Tarot {
    use art3mis::components::Counter::CounterComponent;
    use core::num::traits::zero::Zero;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::extensions::ERC721EnumerableComponent;
    use openzeppelin::token::erc721::{
        ERC721Component, interface::{IERC721Metadata, IERC721MetadataCamelOnly}
    };

    use starknet::{
        ContractAddress, get_block_timestamp, ClassHash
    };
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Vec, VecTrait, MutableVecTrait, Map
    };

    use openzeppelin::access::ownable::OwnableComponent;

    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;

    // use art3mis::helper::{convert1, convert2, convert3};

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: CounterComponent, storage: token_id_counter, event: CounterEvent);
    component!(path: ERC721EnumerableComponent, storage: enumerable, event: EnumerableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    // // ERC721 
    #[abi(embed_v0)]
    impl ERC721Impl = ERC721Component::ERC721Impl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;
    #[abi(embed_v0)]
    impl ERC721EnumerableImpl =
        ERC721EnumerableComponent::ERC721EnumerableImpl<ContractState>;
    #[abi(embed_v0)]
    impl ERC721CamelOnlyImpl = ERC721Component::ERC721CamelOnlyImpl<ContractState>;

    // // Ownable 
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OWnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    /// Counter
    #[abi(embed_v0)]
    impl CounterImpl = CounterComponent::CounterImpl<ContractState>;

    /// Upgradeable
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        cards: Vec<ByteArray>,
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        token_id_counter: CounterComponent::Storage,
        #[substorage(v0)]
        enumerable: ERC721EnumerableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
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
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        CounterEvent: CounterComponent::Event,
        EnumerableEvent: ERC721EnumerableComponent::Event,
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
        let name: ByteArray = "Art3misOracle";
        let symbol: ByteArray = "AT";
        let base_uri: ByteArray = "https://ipfs.io/ipfs/";

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
            // }else{
            //     output.append(@", reverse");
            }
            output
        }

        fn mint(ref self: ContractState, recipient: ContractAddress, token_uri: ByteArray) -> u256{
            self.token_id_counter.increment();
            let token_id = self.token_id_counter.current();
            self.erc721.mint(recipient, token_id);
            self.set_token_uri(token_id, token_uri);
            token_id
        }
    }

    impl ERC721EnumerableHooksImpl<
        T,
        impl ERC721Enumerable: ERC721EnumerableComponent::HasComponent<T>,
        impl Counter: CounterComponent::HasComponent<T>,
        impl HasComponent: ERC721Component::HasComponent<T>,
        +SRC5Component::HasComponent<T>,
        +Drop<T>
    > of ERC721Component::ERC721HooksTrait<T> {
        // Implement this to add custom logic to the ERC721 hooks
        // Similar to _beforeTokenTransfer in OpenZeppelin ERC721.sol
        fn before_update(
            ref self: ERC721Component::ComponentState<T>,
            to: ContractAddress,
            token_id: u256,
            auth: ContractAddress
        ) {
            let counter_component = get_dep_component!(@self, Counter);
            let token_id_counter = counter_component.current();
            let mut enumerable_component = get_dep_component_mut!(ref self, ERC721Enumerable);
            if (token_id == token_id_counter) { // `Mint Token` case: Add token to `ERC721Enumerable_all_tokens` enumerable component
                let length = enumerable_component.ERC721Enumerable_all_tokens_len.read();
                enumerable_component.ERC721Enumerable_all_tokens_index.write(token_id, length);
                enumerable_component.ERC721Enumerable_all_tokens.write(length, token_id);
                enumerable_component.ERC721Enumerable_all_tokens_len.write(length + 1);
            } else if (token_id < token_id_counter
                + 1) { // `Transfer Token` Case: Remove token from owner and update enumerable component
                // To prevent a gap in from's tokens array, we store the last token in the index of
                // the token to delete, and then delete the last slot (swap and pop).
                let owner = self.owner_of(token_id);
                if owner != to {
                    let last_token_index = self.balance_of(owner) - 1;
                    let token_index = enumerable_component
                        .ERC721Enumerable_owned_tokens_index
                        .read(token_id);

                    // When the token to delete is the last token, the swap operation is unnecessary
                    if (token_index != last_token_index) {
                        let last_token_id = enumerable_component
                            .ERC721Enumerable_owned_tokens
                            .read((owner, last_token_index));
                        // Move the last token to the slot of the to-delete token
                        enumerable_component
                            .ERC721Enumerable_owned_tokens
                            .write((owner, token_index), last_token_id);
                        // Update the moved token's index
                        enumerable_component
                            .ERC721Enumerable_owned_tokens_index
                            .write(last_token_id, token_index);
                    }

                    // Clear the last slot
                    enumerable_component
                        .ERC721Enumerable_owned_tokens
                        .write((owner, last_token_index), 0);
                    enumerable_component.ERC721Enumerable_owned_tokens_index.write(token_id, 0);
                }
            }
            if (to == Zero::zero()) { // `Burn Token` case: Remove token from `ERC721Enumerable_all_tokens` enumerable component
                let last_token_index = enumerable_component.ERC721Enumerable_all_tokens_len.read()
                    - 1;
                let token_index = enumerable_component
                    .ERC721Enumerable_all_tokens_index
                    .read(token_id);

                let last_token_id = enumerable_component
                    .ERC721Enumerable_all_tokens
                    .read(last_token_index);

                enumerable_component.ERC721Enumerable_all_tokens.write(token_index, last_token_id);
                enumerable_component
                    .ERC721Enumerable_all_tokens_index
                    .write(last_token_id, token_index);

                enumerable_component.ERC721Enumerable_all_tokens_index.write(token_id, 0);
                enumerable_component.ERC721Enumerable_all_tokens.write(last_token_index, 0);
                enumerable_component.ERC721Enumerable_all_tokens_len.write(last_token_index);
            } else if (to != auth) { // `Mint Token` and `Transfer Token` case: Add token owner to `ERC721Enumerable_owned_tokens` enumerable component
                let length = self.balance_of(to);
                enumerable_component.ERC721Enumerable_owned_tokens.write((to, length), token_id);
                enumerable_component.ERC721Enumerable_owned_tokens_index.write(token_id, length);
            }
        }

        fn after_update(
            ref self: ERC721Component::ComponentState<T>,
            to: ContractAddress,
            token_id: u256,
            auth: ContractAddress
        ) {}
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            // This function can only be called by the owner
            self.ownable.assert_only_owner();

            // Replace the class hash upgrading the contract
            self.upgradeable.upgrade(new_class_hash);
        }
    }

}