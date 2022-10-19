// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment the line to use openzeppelin/ERC20
// You can use this dependency directly because it has been installed already
import "./erc.sol";
import "./souvenir.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract StudentSocietyDAO {

    // use a event if you want
    event ProposalInitiated(uint32 proposalIndex);
    event ProposalVotedAnonymously(address voter, uint32 proposalIndex);
    event ProposalVoted(address voter, uint32 proposalIndex, bool choice);
    event ProposalApproved(uint32 proposalIndex);
    event ProposalNotApproved(uint32 proposalIndex);
    event haveSouvenir(address player, uint256 id);

    uint256 constant public PROPOSAL_TOKEN = 500;
    uint256 constant public PROPOSAL_REWARD = 1000;
    uint256 constant public VOTE_TOKEN = 100;
    uint256 constant public INIT_TOKEN = 1000;
    Proposal private p;
    uint32 private idx = 0;
    address[] public members;

    struct Proposal {
        uint32 index;      // index of this proposal
        address proposer;  // who make this proposal
        uint256 startTime; // proposal start time
        uint256 duration;  // proposal duration
        string name;       // proposal name
        bool isSecret;     // whether vote in secret
        int32 isDone;
    }

    MyERC20 studentERC20;
    MyERC721 souvenir;
    mapping(uint32 => Proposal) public proposals; // A map from proposal index to proposal
    mapping(uint32 => uint32) yeas;        // Yeas for a certain proposal
    mapping(uint32 => uint32) nays;        // Nays for a certain proposal
    mapping(address => uint32) approvedProposals;
    mapping(address => bool) isInited;
    mapping(address => uint256) souvenirs;

    constructor() {
        // maybe you need a constructor
        studentERC20 = new MyERC20("KitakubuToken", "KTC");
        souvenir = new MyERC721("Souvenir", "SVR");
    }

    // function helloworld() pure external returns(string memory) {
    //     return "hello world";
    // }

    // create a proposal
    function createProposal(uint256 startTime, uint256 duration, string memory name, bool isSecret) 
                            external returns(string memory) {
        require(studentERC20.balanceOf(msg.sender) >= PROPOSAL_TOKEN, "Token balance is insufficient");
        p = Proposal(idx, msg.sender, startTime, duration, name, isSecret, -1);
        studentERC20.transferFrom(msg.sender, address(this), PROPOSAL_TOKEN);
        proposals[p.index] = p;
        yeas[p.index] = 0;
        nays[p.index] = 0;
        idx++;
        emit ProposalInitiated(p.index);
        return "Create proposal success";
    }

    function vote(uint32 index, bool choice) external returns(string memory) {
        p = proposals[index];
        require(block.timestamp >= p.startTime && block.timestamp < p.startTime + p.duration, "Proposal has been closed");
        require(studentERC20.balanceOf(msg.sender) >= VOTE_TOKEN, "Token balance is insufficient");
        studentERC20.transferFrom(msg.sender, address(this), VOTE_TOKEN);
        if (choice)
            yeas[p.index]++;
        else
            nays[p.index]++;
        if (p.isSecret)
            emit ProposalVotedAnonymously(msg.sender, index);
        else
            emit ProposalVoted(msg.sender, index, choice);
        return "Vote success";
    }

    function checkProposals() external {
        uint32 i;
        for (i = 0; i < idx; i++) {
            p = proposals[i];
            if (p.isDone == -1 && block.timestamp > p.startTime + p.duration) {
                if (yeas[p.index] > nays[p.index]) {
                    emit ProposalApproved(p.index);
                    approvedProposals[p.proposer]++;
                    studentERC20.transfer(p.proposer, PROPOSAL_REWARD);
                    p.isDone = 1;
                    if (approvedProposals[p.proposer] == 3) {
                        uint256 id = souvenir.awardItem(p.proposer, "path/to/address.json");
                        souvenirs[p.proposer] = id;
                        emit haveSouvenir(p.proposer, id);
                    }
                }
                else {
                    emit ProposalNotApproved(p.index);
                    p.isDone = 0;
                }
            }
            proposals[i] = p;
        }
    }

    function getFreeToken() external {
        require(!isInited[msg.sender], "You have already got the token");
        members.push(msg.sender);
        approvedProposals[msg.sender] = 0;
        isInited[msg.sender] = true;
        studentERC20.transfer(msg.sender, INIT_TOKEN);
        studentERC20.allowance(msg.sender);
    }

    function getMyToken() view external returns(uint256) {
        return studentERC20.balanceOf(msg.sender);
    }

    function getProposal(uint32 index) view external returns(Proposal memory) {
        return proposals[index];
    }

    function getIndex() view external returns(uint32) {
        return idx;
    }

    function getMySouvenir() view external returns(string memory) {
        return souvenir.getTokenURI(souvenirs[msg.sender]);
    }
}