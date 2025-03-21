import { Box, Card, CardContent, CircularProgress, Divider, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { PriceCardContent } from "./home";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ref, onValue, off } from "firebase/database";
import { db } from "../main";
import GaugeComponent from "react-gauge-component";

export default function MonitoringUI() {
    const [batteryStatus, setBatteryStatus] = useState();
    const [connectedUsers, setConnectedUsers] = useState();
    // ping raspberryPi to check its status
    // 0 is disconnected, 1 is trying to connect, 2 is connected
    const [deviceStatus, setDeviceStatus] = useState(0);

    const navigate = useNavigate();
    const isDbFetched = useRef(false);

    useEffect(() => {
        if (isDbFetched.current) return;
        isDbFetched.current = true;

        const monitoringDataRef = ref(db, 'monitoring/');
        const monitoringDataListener = onValue(monitoringDataRef, (snapshot) => {
            const dbMonitoring = snapshot.val();

            setBatteryStatus(dbMonitoring.batteryStatus);
            setConnectedUsers(dbMonitoring.connectedUsers);
        })


        //TODO
        setDeviceStatus(1)
        setTimeout(() => {
            setDeviceStatus(Math.random() < 0.5 ? 0 : 2)
        }, 5000)


        const tryConnect = setInterval(() => {
            // PING FAST API CODE
            // ASK GPT TO DO CODE & CHANGE STATUS WHEN DEVICE IS DISCONNECTED
            // IF POSSIBLE WITHOUT INTERVAL TO CHECK CONNECTED EVERY X SECONDS
            // SO THIS CODE ONLY RUN WHEN THE DEVICE IS DISCONNECTED
            // INSTEAD OF EVERYTIME

            clearInterval(tryConnect);
        }, 5000);


        return () => off(monitoringDataRef, "value", monitoringDataListener);
    }, [])


    return (
        <Stack spacing={2} paddingTop={10}>
            <Card variant="outlined">
                <Stack spacing={2} padding={2}>
                    <Typography variant="h6" fontWeight={600} textAlign="center">
                        Status Perangkat
                    </Typography>
                    <Stack direction="row" justifyContent="center" spacing={2}>
                        {{
                            2: (
                                <>
                                    <span className="material-symbols-outlined">wifi</span>
                                    <Typography>Perangkat Wi-Fi Koin terhubung</Typography>
                                </>
                            ),
                            0: (
                                <>
                                    <span className="material-symbols-outlined">wifi_off</span>
                                    <Typography>Tidak dapat menjangkau perangkat</Typography>
                                </>
                            )
                        }[deviceStatus] || (
                                <>
                                    <span className="material-symbols-outlined">wifi_protected_setup</span>
                                    <Typography>Mencoba menghubungi perangkat</Typography>
                                </>
                            )}
                    </Stack>
                    {
                        deviceStatus == 0 && (
                            <Typography textAlign="center">
                                Tidak dapat terhubung ke perangkat. Data mungkin tidak ter-update.
                            </Typography>
                        )
                    }
                    <Divider />
                    {
                        batteryStatus?.battery <= 20 && (
                            <Typography color="red" textAlign="center">
                                Baterai tersisa {batteryStatus.battery}%. Segera sambungkan catu daya sebelum perangkat mati!
                            </Typography>
                        )}
                    {
                        batteryStatus?.power <= 10 && (
                            <Typography color="red" textAlign="center">
                                Daya yang dihasilkan panel surya rendah. Perangkat mungkin akan menggunakan daya baterai
                            </Typography>
                        )}
                </Stack>
            </Card>
            <Card variant="outlined">
                <PriceCardContent />
            </Card>
            <Card variant="outlined">
                <Stack spacing={2} paddingX={2} paddingY={2}>
                    <Typography variant="h6" fontWeight={600} textAlign="center">
                        Pengguna
                    </Typography>
                    <Stack direction='row' spacing={2} justifyContent='center'>
                        {
                            (connectedUsers != null) ? (
                                <>
                                    <span className="material-symbols-outlined">
                                        group
                                    </span>
                                    <Typography variant="body1">
                                        {
                                            Object.keys(connectedUsers).length + " Perangkat terhubung"
                                        }
                                    </Typography></>
                            ) : (
                                <Typography variant="body1">
                                    Tidak ada perangkat terhubung
                                </Typography>
                            )
                        }
                    </Stack>
                    {
                        (connectedUsers != null && Object.keys(connectedUsers).length > 0) ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>MAC Address</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Waktu</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(connectedUsers).map(([key, value]) => {
                                            const userLeaseStart = new Date(value.userLeaseStart)
                                            const userLeaseEnd = new Date(value.userLeaseEnd)

                                            function getTime(date) {
                                                const hour = date.getHours();
                                                const minute = date.getMinutes();

                                                return `${hour.toString().padStart(2, "0")}.${minute.toString().padStart(2, "0")}`
                                            }

                                            return (
                                                <TableRow
                                                    key={key}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row" align="center">
                                                        {value.userIP}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {value.userMAC}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {getTime(userLeaseStart)} - {getTime(userLeaseEnd)}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (<></>)
                    }
                </Stack>
            </Card>
            <Stack spacing={4}>
                <Typography variant="h6" fontWeight={600} textAlign="center" paddingTop={2}>Informasi Panel Surya</Typography>
                <Stack
                    direction="row"
                    useFlexGap
                    sx={{ flexWrap: 'wrap' }}
                    justifyContent="center"
                    spacing={2}
                >
                    <Card variant="outlined">
                        <Stack padding={2}>
                            <Typography variant="body1" textAlign="center">Daya saat ini</Typography>
                            <GaugeComponent
                                type="semicircle"
                                arc={{
                                    gradient: true,
                                    width: 0.25,
                                    cornerRadius: 16,
                                    subArcs: [
                                        {
                                            limit: 50,
                                            color: "RGB(20, 40, 100)"
                                        },
                                        {
                                            limit: 200,
                                            color: "RGB(100, 140, 200)"
                                        },
                                        {
                                            color: "RGB(120, 180, 220)"
                                        }
                                    ]
                                }}
                                pointer={{ type: "needle" }}
                                minValue={-20}
                                maxValue={300}
                                value={(batteryStatus != null) ? batteryStatus.power : 0}
                                labels={{
                                    valueLabel: {
                                        formatTextValue: () => ``,
                                    },
                                    tickLabels: {
                                        hideMinMax: true
                                    }
                                }}
                            />
                            <Typography textAlign="center" variant="h6" fontWeight={600} color={batteryStatus?.power < 12 && "red"}>{(batteryStatus != null) ? batteryStatus.power : 0} Watt</Typography>
                        </Stack>
                    </Card>
                    <Card variant="outlined">
                        <Stack padding={2}>
                            <Typography variant="body1" textAlign="center">Total energi hari ini</Typography>
                            <GaugeComponent
                                type="semicircle"
                                arc={{
                                    gradient: true,
                                    width: 0.25,
                                    cornerRadius: 16,
                                    subArcs: [
                                        {
                                            limit: 50,
                                            color: "RGB(20, 40, 100)"
                                        },
                                        {
                                            limit: 200,
                                            color: "RGB(100, 140, 200)"
                                        },
                                        {
                                            color: "RGB(120, 180, 220)"
                                        }
                                    ]
                                }}
                                pointer={{ type: "needle" }}
                                minValue={-20}
                                maxValue={300}
                                value={(batteryStatus != null) ? batteryStatus.powerTotal : 0}
                                labels={{
                                    valueLabel: {
                                        formatTextValue: () => ``,
                                    },
                                    tickLabels: {
                                        hideMinMax: true
                                    }
                                }}
                            />
                            <Typography textAlign="center" variant="h6" fontWeight={600}>{(batteryStatus != null) ? batteryStatus.powerTotal : 0} KWh</Typography>
                        </Stack>
                    </Card>
                    <Card>
                        <Stack padding={2}>
                            <Typography variant="body1" textAlign="center">Status baterai</Typography>
                            <GaugeComponent
                                type="semicircle"
                                arc={{
                                    gradient: true,
                                    width: 0.2,
                                    cornerRadius: 16,
                                    subArcs: [
                                        {
                                            color: "red"
                                        },
                                        {
                                            color: "yellow"
                                        },
                                        {
                                            color: "lightgreen"
                                        }
                                    ]
                                }}
                                pointer={{ type: "needle" }}
                                minValue={-5}
                                maxValue={100}
                                value={(batteryStatus != null) ? batteryStatus.battery : 0}
                                labels={{
                                    valueLabel: {
                                        formatTextValue: () => ``,
                                    },
                                    tickLabels: {
                                        hideMinMax: true
                                    }
                                }}
                            />
                            <Typography textAlign="center" variant="h6" fontWeight={600} color={batteryStatus?.battery <= 20 && "red"}>{(batteryStatus != null) ? batteryStatus.battery : 0}%</Typography>
                        </Stack>
                    </Card>
                </Stack>
            </Stack>
        </Stack>
    )
}