import StudentSocietyDAO from "./abis/StudentSocietyDAO.json"
import MyERC20 from "./abis/MyERC20.json"
import address from "./address.json"
// import MyERC721 from "./abis/MyERC721.json"

const Web3 = require("web3")

// @ts-ignore
// 创建web3实例
let web3 = new Web3(window.web3.currentProvider)

const mainABI  = StudentSocietyDAO.abi
const myERC20  = MyERC20.abi
// const myERC721 = MyERC721.abi

// 获取合约实例
const mainContract     = new web3.eth.Contract(mainABI, address.main)
const myERC20Contract  = new web3.eth.Contract(myERC20, address.ERC20)
// const myERC721Contract = new web3.eth.Contract(myERC721)

// 导出
export { web3, mainContract, myERC20Contract }
