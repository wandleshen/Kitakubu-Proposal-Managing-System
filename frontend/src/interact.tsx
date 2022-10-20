import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import { web3, mainContract, myERC20Contract } from './utlis/contracts'

const GanacheTestChainId = '0x539'; // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain';
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

const Text = styled('text')(({ theme }) => ({
...theme.typography.button,
backgroundColor: '#0078d0',
padding: theme.spacing(1),
}));

const LinkAccount = () => {

    const [account, setAccount] = React.useState('');
    const [accountBalance, setAccountBalance] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [errMsg, setError] = React.useState('');

    React.useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    React.useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC20Contract) {
                const ab = await myERC20Contract.methods.balanceOf(account).call();
                setAccountBalance(ab);
            } else {
                alert('Contract not exists.');
            }
        }

        if(account !== '') {
            getAccountInfo();
        }
    }, [account]);

    const onClickGetToken = async () => {
        if (mainContract && myERC20Contract) {
            try {
                await mainContract.methods.getFreeToken().send({
                    from: account
                })
                const ab = await myERC20Contract.methods.balanceOf(account).call();
                setAccountBalance(ab);
            } catch (error: any) {
                setError(error.message);
                setOpen(true);
            }
        } else {
            setError("Contract not exists!");
            setOpen(true);
        }
    }

    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const { ethereum } = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            setError("Metamask is not installed!");
            setOpen(true);
            return;
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.chainId }] })
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({
                            method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({ method: 'eth_requestAccounts' });
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            setError(error.message);
            setOpen(true);
        }
    }
    
    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const action = (
        <React.Fragment>
            <Button color="secondary" size="small" onClick={handleClose}>
            UNDO
            </Button>
            <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
            >
            <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    return (
        <div style={{ marginLeft: 'auto' }}>
            { account === '' && 
                <Button variant='outlined' onClick={ onClickConnectWallet } style={{ color: "#ffffff" }}>Link Wallet</Button> 
            }
            { account !== '' &&
                <div>
                    { !mainContract.methods.getisInited(account).call() &&                     
                        <Button variant='outlined' onClick={ onClickGetToken } style={{ color: "#ffffff" }}>Click to Get Tokens</Button> 
                    }
                    { mainContract.methods.getisInited(account).call() && 
                        <Text>Balance:  {accountBalance} </Text>
                    }
                    <Chip avatar={<Avatar>{ account.substring(2, 3) }</Avatar>}
                    label={ account.substring(0, 5) }
                    variant="outlined" style={{ color: "#ffffff" }} />
                </div>
            }
            <Snackbar
              open={open}
              autoHideDuration={6000}
              onClose={handleClose}
              message={ errMsg }
              action={action}
            >
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    { errMsg }
                </Alert>
            </Snackbar>
        </div>
    );
}

const Proposal = () => {
    return (
        <div></div>
    );
}

export { LinkAccount, Proposal }