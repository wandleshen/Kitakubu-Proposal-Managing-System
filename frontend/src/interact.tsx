import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import dayjs, { Dayjs } from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const LinkAccount = () => {

    const [account, setAccount] = React.useState('');
    const [accountBalance, setAccountBalance] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [errMsg, setError] = React.useState('');
    const [init, setInit] = React.useState(false);
    const [URI, setURI] = React.useState('');

    React.useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const { ethereum } = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if (accounts && accounts.length) {
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
                setError('Contract not exists.');
                setOpen(true);
            }
        }

        if (account !== '') {
            getAccountInfo();
            mainContract.methods.isInited(account).call().then(function (res: Boolean) {
                if (res) {
                    setInit(true);
                } else {
                    setInit(false);
                    // window.location.reload();
                }
            })
        }
    }, [account]);

    React.useEffect(() => {
        const getSouvenir = async () => {
            var my = account;
            // 尝试获取连接的用户账户
            const accounts = await web3.eth.getAccounts()
            if (accounts && accounts.length) {
                my = accounts[0];
            }
            const souvenir = await mainContract.methods.getMySouvenir(my).call();
            setURI(souvenir);
        }

        getSouvenir();
    })

    const onClickGetToken = async () => {
        if (mainContract && myERC20Contract) {
            try {
                await mainContract.methods.getFreeToken().send({
                    from: account
                })
                const ab = await myERC20Contract.methods.balanceOf(account).call();
                setAccountBalance(ab);
                window.location.reload();
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
            {account === '' &&
                <Button variant='outlined' onClick={onClickConnectWallet} style={{ color: "#ffffff" }}>Link Wallet</Button>
            }
            {account !== '' &&
                <div>
                    {(init)
                        ? <React.Fragment><img src={URI} alt= "" /><Text>Balance:  {accountBalance} KTC</Text></React.Fragment>
                        : <Button variant='outlined' onClick={onClickGetToken} style={{ color: "#ffffff" }}>Click to Get Tokens</Button>
                    }
                    <Chip avatar={<Avatar>{account.substring(2, 3)}</Avatar>}
                        label={account.substring(0, 5)}
                        variant="outlined" style={{ color: "#ffffff" }}
                    />
                </div>
            }
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message={errMsg}
                action={action}
            >
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {errMsg}
                </Alert>
            </Snackbar>
        </div>
    );
}

declare module 'dayjs' {
    interface Dayjs {
        fromNow(): String;
    }
}

const Proposal = () => {

    const [open, setOpen] = React.useState(false);
    const [openBck, setOpenBck] = React.useState(false);
    const [errMsg, setError] = React.useState('');

    const [h, setH] = React.useState(<div>No proposals yet</div>);
    const [load, setLoad] = React.useState(false);

    const [sopen, setSopen] = React.useState(false);
    const [sMsg, setS] = React.useState('');

    React.useEffect(() => {
        const getAllProposals = async () => {
            let html = <div>No proposals yet</div>;
            var relativeTime = require('dayjs/plugin/relativeTime');
            dayjs.extend(relativeTime);
            if (mainContract && myERC20Contract) {
                try {
                    const index = await mainContract.methods.idx().call();
                    var name: String[] = [];
                    var starts: String[] = [];
                    var ss: String[] = [];
                    var startTime: Number[] = [];
                    var duration: Number[] = [];
                    var isDone: Number[] = [];
                    var isVote: Boolean[] = [];
                    var account = '';
                    const accounts = await web3.eth.getAccounts()
                    if (accounts && accounts.length) {
                        account = accounts[0];
                    }
                    for (var i = 0; i < index; i++) {
                        const prop = await mainContract.methods.proposals(i).call();
                        const isVoted = await mainContract.methods.getIsVoted(account, i).call();
                        const startDate = dayjs(Number(prop.startTime)*1000);
                        const endDate = dayjs(dayjs((Number(prop.startTime)+Number(prop.duration))*1000));
                        const start = 'Start at ' + startDate.format('YYYY-MM-DD HH:mm:ss') + ' (' + startDate.fromNow() + ')';
                        const s = 'Close at ' + endDate.format('YYYY-MM-DD HH:mm:ss') + ' (' + endDate.fromNow() + ')';
                        name.push(prop.name);
                        starts.push(start);
                        ss.push(s);
                        startTime.push(Number(prop.startTime));
                        duration.push(Number(prop.duration));
                        isDone.push(prop.isDone);
                        isVote.push(isVoted);
                    }
                    html =  <React.Fragment>
                        <Stack spacing={2} divider={<Divider flexItem />}>
                    {name.map((n: String, index) =>
                    <Item elevation={0} >
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{n}</div>
                        <div>{starts[index]}</div>
                        <div>{ss[index]}</div>
                        {((Number(startTime[index])+Number(duration[index]))-dayjs().unix() > 0)?
                            (Number(startTime[index]) < dayjs().unix() && !isVote[index]) ?
                            <ButtonGroup variant="outlined" aria-label="outlined primary button group">
                                <Button onClick={()=>{upVote(index)}}>Yea</Button>
                                <Button onClick={()=>{downVote(index)}}>Nay</Button>
                            </ButtonGroup>
                            :
                            <ButtonGroup variant="outlined" aria-label="outlined primary button group">
                                <Button disabled>Yea</Button>
                                <Button disabled>Nay</Button>
                            </ButtonGroup>
                            :
                                (isDone[index] < 0) ?
                                <Button variant="outlined" onClick={manageProp}>Manage</Button>
                                :
                                (isDone[index] == 0) ?
                                    <Button disabled style={{ color: "#fc4334" }}>Not Approved</Button>
                                    :
                                    <Button disabled style={{ color: "#60ba6d" }}>Approved</Button>}
                    </Item>
                    )}
                    </Stack>
                    </React.Fragment>
                } catch (error: any) {
                    setError(error.message);
                    setOpen(true);
                }
            } else {
                setError("Contract not exists!");
                setOpen(true);
            }
            return (
                html
            );
        }
        getAllProposals().then(function (res: JSX.Element) { setH(res); setLoad(true); });
    }, [])

    const onClickCreateProposal = async () => {
        setProposalName('');
        setValue(dayjs());
        setEndValue(dayjs().add(1, 'day'));
        setOpenBck(true);
    }

    const [value, setValue] = React.useState<Dayjs | null>(
        dayjs(),
    );

    const [endValue, setEndValue] = React.useState<Dayjs | null>(
        dayjs(),
    );

    const [proposalName, setProposalName] = React.useState('');

    const handleChange = (newValue: Dayjs | null) => {
        setValue(newValue);
    };

    const handleEndChange = (newValue: Dayjs | null) => {
        setEndValue(newValue);
    };

    const handleName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProposalName(event.target.value);
    }

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
        setOpenBck(false);
        setSopen(false);
    };

    const upVote = async (index: Number) => {
        if (mainContract && myERC20Contract) {
            try {
                var account = '';
                const accounts = await web3.eth.getAccounts()
                if (accounts && accounts.length) {
                    account = accounts[0];
                }
                await mainContract.methods.vote(index, true).send({ from: account });
                setS("Vote success!");
                setSopen(true);
                setTimeout(() => window.location.reload(), 1000);
            } catch (error: any) {
                setError(error.message);
                setOpen(true);
            }
        } else {
            setError("Contract not exists!");
            setOpen(true);
        }
    }

    const downVote = async (index: Number) => {
        if (mainContract && myERC20Contract) {
            try {
                var account = '';
                const accounts = await web3.eth.getAccounts()
                if (accounts && accounts.length) {
                    account = accounts[0];
                }
                await mainContract.methods.vote(index, false).send({ from: account });
                setS("Vote success!");
                setSopen(true);
                setTimeout(() => window.location.reload(), 1000);
            } catch (error: any) {
                setError(error.message);
                setOpen(true);
            }
        } else {
            setError("Contract not exists!");
            setOpen(true);
        }
    }

    const manageProp = async () => {
        if (mainContract && myERC20Contract) {
            try {
                var account = '';
                const accounts = await web3.eth.getAccounts()
                if (accounts && accounts.length) {
                    account = accounts[0];
                }
                await mainContract.methods.checkProposals().send({ from: account });
                setS("All proposals has been checked!");
                setSopen(true);
                setTimeout(() => window.location.reload(), 1000);
            } catch (error: any) {
                setError(error.message);
                setOpen(true);
            }
        } else {
            setError("Contract not exists!");
            setOpen(true);
        }
    }

    const onClickCreate = async () => {
        if (mainContract && myERC20Contract) {
            try {
                var account = '';
                const accounts = await web3.eth.getAccounts()
                if (accounts && accounts.length) {
                    account = accounts[0];
                }
                await mainContract.methods.createProposal(value!.unix(),
                    endValue!.unix() - value!.unix(),
                    proposalName,
                    ).send({
                        from: account
                    })
                window.location.reload()
            } catch (error: any) {
                setError(error.message);
                setOpen(true);
            }
        } else {
            setError("Contract not exists!");
            setOpen(true);
        }
    }

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
        <React.Fragment>
            <Fab color="primary" aria-label="add"
                style={{ position: 'fixed', bottom: '10%', right: '5%' }}
                onClick={onClickCreateProposal}>
                <AddIcon />
            </Fab>
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message={errMsg}
                action={action}
            >
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    {errMsg}
                </Alert>
            </Snackbar>
            <Snackbar
                open={sopen}
                autoHideDuration={6000}
                onClose={handleClose}
                message={sMsg}
                action={action}
            >
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    {sMsg}
                </Alert>
            </Snackbar>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBck}
            >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box
                        component="form"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '25ch' },
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <div style={{ backgroundColor: '#ffffff' }}>
                            <Text>Create Proposal</Text>
                            <div style={{ marginBottom: '10px' }}></div>
                            <TextField
                                id="outlined"
                                label="Proposal Name"
                                defaultValue=""
                                value={proposalName}
                                onChange={handleName}
                            />
                            <div></div>
                            <DateTimePicker
                                label="Start Time"
                                value={value}
                                onChange={handleChange}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <DateTimePicker
                                label="End Time"
                                value={endValue}
                                onChange={handleEndChange}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <div></div>
                            <Button variant='contained' onClick={onClickCreate} style={{ marginLeft: '10%', marginBottom: '2%', marginTop: '2%' }}>Create</Button>
                            <Button variant='contained' onClick={handleClose} style={{ marginLeft: '20%' }}>Cancel</Button>
                        </div>
                    </Box>
                </LocalizationProvider>
            </Backdrop>
            {load && h}
        </React.Fragment>
    );
}

export { LinkAccount, Proposal }