// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment the line to use openzeppelin/ERC721
// You can use this dependency directly because it has been installed already
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyERC721 is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping (uint256 => string) private _tokenURIs;

    constructor(string memory name, string memory symbol) public ERC721(name, symbol) {}

    function awardItem(address player, string memory tokenURI) public returns(uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);

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