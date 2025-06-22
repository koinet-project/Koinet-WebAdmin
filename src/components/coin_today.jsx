import { Card, Typography, Stack, TableContainer, TableRow, Table, TableHead, TableCell, TableBody } from "@mui/material";
import { child, get, off, onValue, ref } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import GaugeComponent from "react-gauge-component";
import { db } from "../main";
import { formatRupiah } from "../helper/currency_format";

export default function CoinGauge() {
    const isLoaded = useRef(false);

    const [yesterdayCoinList, setYesterdayCoinList] = useState();
    const [yesterdayCoin, setYesterdayCoin] = useState(0);
    const [todayCoinList, setTodayCoinList] = useState();
    const [todayCoin, setTodayCoin] = useState(0);

    useEffect(() => {
        if (isLoaded.current) return
        isLoaded.current = true

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const todayYear = today.getFullYear();
        const todayMonth = (today.getMonth() + 1).toString().padStart(2, '0');
        const todayDate = today.getDate().toString().padStart(2, '0');

        const ytdYear = yesterday.getFullYear();
        const ytdMonth = (yesterday.getMonth() + 1).toString().padStart(2, '0');
        const ytdDate = yesterday.getDate().toString().padStart(2, '0');

        const todayISO = `${todayYear}-${todayMonth}-${todayDate}`;
        const yesterdayISO = `${ytdYear}-${ytdMonth}-${ytdDate}`;

        const coinDataRef = ref(db, "monitoring/coin_input");

        get(child(coinDataRef, `${yesterdayISO}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
            
                setYesterdayCoinList(data)

                if (data && typeof data === 'object') {
                    const total = Object.values(data).reduce((sum, num) => sum + num, 0);
                    setYesterdayCoin(total)
                }
                else if (Array.isArray(data)) {
                    const total = data.reduce((sum, num) => sum + num, 0);
                    console.log("Total coins:", total);
                } else {
                    console.log("Data is not an array:", data);
                }
            }
        })

        const todayDataRef = ref(db, "monitoring/coin_input/" + todayISO);
        const todayCoinListener = onValue(todayDataRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
        
                setTodayCoinList(data);

                if (data && typeof data === 'object') {
                    const total = Object.values(data).reduce((sum, num) => sum + num, 0);
                    setTodayCoin(total)
                }
                else if (Array.isArray(data)) {
                    const total = data.reduce((sum, num) => sum + num, 0);
                    console.log("Total coins:", total);
                } else {
                    console.log("Data is not an array:", data);
                }
            }
        })

        return () => {
            off(todayDataRef, "value", todayCoinListener);
        }
    }, [])

    return (
        <>
        <Card>
            {yesterdayCoin > 0 ? (
                <>
                    <Stack padding={2}>
                <Typography variant="body1" textAlign="center">Kemarin</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>MAC Address</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Jumlah Koin</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                (yesterdayCoinList) ? (
                                    Object.entries(yesterdayCoinList).map(([key, value]) => {
                                        return (
                                            <TableRow
                                                key={key}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row" align="center">{key}</TableCell>
                                                <TableCell align="center">{value}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (<></>)
                            }
                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell align="center">Total</TableCell>
                                <TableCell align="center">{yesterdayCoin}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
            <Typography variant="h6" fontWeight={500} textAlign={"center"}>Pendapatan</Typography>
            <Typography variant="h6" fontWeight={600} textAlign={"center"} paddingBottom={2}>Rp {formatRupiah(yesterdayCoin * 1000)}</Typography>
                </>
            ) : <Stack direction="column" padding={2}> 
                    <Typography variant="body1" textAlign="center">Kemarin</Typography>
                    <Typography variant="h6" fontWeight={500} textAlign={"center"} padding={2}>Belum ada pemasukan</Typography>
                </Stack>}
        </Card>
        <Card>
            {todayCoin > 0 ? (
                <>
                <Stack padding={2}>
                <Typography variant="body1" textAlign="center">Hari ini</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>MAC Address</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Jumlah Koin</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                (todayCoinList) ? (
                                    Object.entries(todayCoinList).map(([key, value]) => {
                                        return (
                                            <TableRow
                                                key={key}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row" align="center">{key}</TableCell>
                                                <TableCell align="center">{value}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (<></>)
                            }
                            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell align="center">Total</TableCell>
                                <TableCell align="center">{todayCoin}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
            <Typography variant="h6" fontWeight={500} textAlign={"center"}>Pemasukan</Typography>
            <Typography variant="h6" fontWeight={600} textAlign={"center"}>Rp {formatRupiah(todayCoin * 1000)}</Typography></>
            ) : (
                <Stack direction="column" padding={2}>
                    <Typography variant="body1" textAlign="center">Hari ini</Typography> 
                    <Typography variant="h6" fontWeight={500} textAlign={"center"} padding={2}>Belum ada pemasukan</Typography>
                </Stack>
            )}
        </Card>
        </>
    )
}