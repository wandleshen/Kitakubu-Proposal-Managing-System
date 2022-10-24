import StudentSocietyDAO from "./abis/StudentSocietyDAO.json"
import MyERC20 from "./abis/MyERC20.json"
// import MyERC721 from "./abis/MyERC721.json"

const Web3 = require("web3")

// @ts-ignore
// 创建web3实例
let web3 = new Web3(window.web3.currentProvider)

const mainABI  = StudentSocietyDAO.abi
const myERC20  = MyERC20.abi
// const myERC721 = MyERC721.abi

// 获取合约实例
const mainContract     = new web3.eth.Contract(mainABI, '0x54Cc2644c1605901F50D215b2295e891C1685d1B')
const myERC20Contract  = new web3.eth.Contract(myERC20, '0xC20d3a60402464067d85C19EB0EA874983BCF8ff')
// const myERC721Contract = new web3.eth.Contract(myERC721)

// 导出
export { web3, mainContract, myERC20Contract }
