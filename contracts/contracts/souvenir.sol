// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

// Uncomment the line to use openzeppelin/ERC721
// You can use this dependency directly because it has been installed already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event award(address, uint256);

    mapping (uint256 => string) private _tokenURIs;
    string head = "https://img.shields.io/badge/StarProposer-No.";
    string tail = "-yellow";

    constructor(string memory name, string memory symbol) public ERC721(name, symbol) {}

    function awardItem(address player) public returns(uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);
        string memory tokenURI = string.concat(string.concat(head, Strings.toString(newItemId)), tail);
        _setTokenURI(newItemId, tokenURI);

        emit award(player, newItemId);
        return newItemId;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function getTokenURI(uint256 tokenId) view external returns(string memory) {
        return _tokenURIs[tokenId];
    }
}