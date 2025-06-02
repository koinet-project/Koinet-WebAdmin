import { Box, Card, CardContent, CircularProgress, Divider, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { PriceCardContent } from "./home";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ref, onValue, off } from "firebase/database";
import { db } from "../main";
import GaugeComponent from "react-gauge-component";
import { apiKey } from "../assets/secrets";
import CoinGauge from "../components/coin_today";

export default function MonitoringUI() {
    const [currentVoltage, setCurrentVoltage] = useState();
    const [currentAmpere, setCurrentAmpere] = useState();
    const [totalPower, setTotalPower] = useState();
    const [connectedUsers, setConnectedUsers] = useState();
    const [yesterdayCoin, setYesterdayCoin] = useState();

    const navigate = useNavigate();
    const isLoaded = useRef(false);
    
    useEffect(() => {
        if (isLoaded.current) return;
        isLoaded.current = true;

        const monitoringDataRef = ref(db, "monitoring/");
        const pltsStatusListener = onValue(monitoringDataRef, (snapshot) => {
            const dbMonitoring = snapshot.val();

            // Safely access pltsStatus
            const pltsStatus = dbMonitoring?.pltsStatus;

            if (pltsStatus) {
                setCurrentAmpere(pltsStatus.currentAmpere);
                setCurrentVoltage(pltsStatus.currentVoltage);

                // --- Calculate Total Power (Sum of Hourly Power Output) ---
                let totalDailyPower = 0;
                const hourlyPowerOutput = pltsStatus.hourlyPowerOutput;

                if (hourlyPowerOutput) {
                    // Iterate over the values of the hourlyPowerOutput object
                    // Object.values() returns an array of the object's values
                    // .forEach() or .reduce() can be used to sum them
                    Object.values(hourlyPowerOutput).forEach(powerValue => {
                        // Ensure the value is a number before adding, or default to 0
                        totalDailyPower += typeof powerValue === 'number' ? powerValue : 0;
                    });
                }
                setTotalPower(totalDailyPower);

            } else {
                console.warn("pltsStatus not found in monitoring data.");
                setCurrentVoltage(0);
                setCurrentAmpere(0);
                setTotalPower(0);
            }
        });

        const connectedUsersListener = onValue(monitoringDataRef, (snapshot) => {
            const dbMonitoring = snapshot.val();
            
            // --- Set Connected Users ---
            // Safely access connectedUsers
            const connectedUsers = dbMonitoring?.connectedUsers;
            setConnectedUsers(connectedUsers || {}); // Default to empty object if null/undefined
        });

        return () => {
            off(monitoringDataRef, "value", pltsStatusListener);
            off(monitoringDataRef, "value", connectedUsersListener);
        };
    }, []);

    function formatSecondsToHMS(totalSeconds) {
        if (typeof totalSeconds !== 'number' || totalSeconds < 0) {
            // Basic validation for non-negative numbers
            console.error("Input must be a non-negative number of seconds.");
            return null; 
        }

        totalSeconds = Math.floor(totalSeconds); // Ensure it's an integer

        if (totalSeconds === 0) {
            return "0s";
        }

        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600; // Remaining seconds after extracting hours
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const hmsParts = [];
        if (hours > 0) {
            hmsParts.push(`${hours}h`);
        }
        if (minutes > 0) {
            hmsParts.push(`${minutes}m`);
        }
        if (seconds > 0) {
            hmsParts.push(`${seconds}s`);
        }

        return hmsParts.join(' '); // Join parts with a space
    }

    return (
        <Stack spacing={2} paddingTop={10}>
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
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Kuota</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold '}}>Sisa Kuota</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.entries(connectedUsers).map(([key, value]) => {
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
                                                        {formatSecondsToHMS(value.uptimeLimit)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {formatSecondsToHMS(value.uptime)}
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
                <Typography variant="h6" fontWeight={600} textAlign="center" paddingTop={2}>Pemasukan</Typography>
                <Stack
                    direction="row"
                    useFlexGap
                    sx={{ flexWrap: 'wrap' }}
                    justifyContent="center"
                    spacing={2}
                >
                    <CoinGauge/>
                </Stack>
            </Stack>
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
                            <Typography variant="body1" textAlign="center">Tegangan</Typography>
                            <GaugeComponent
                                type="semicircle"
                                arc={{
                                    gradient: true,
                                    width: 0.25,
                                    cornerRadius: 16,
                                    subArcs: [
                                        {
                                            limit: 20,
                                            color: "RGB(20, 40, 100)"
                                        },
                                        {
                                            limit: 50,
                                            color: "RGB(100, 140, 200)"
                                        },
                                        {
                                            color: "RGB(120, 180, 220)"
                                        }
                                    ]
                                }}
                                pointer={{ type: "needle" }}
                                minValue={0}
                                maxValue={60}
                                value={(currentVoltage != null) ? currentVoltage : 0}
                                labels={{
                                    valueLabel: {
                                        formatTextValue: () => ``,
                                    },
                                    tickLabels: {
                                        hideMinMax: true
                                    }
                                }}
                            />
                            <Typography textAlign="center" variant="h6" fontWeight={600}>{(currentVoltage != null) ? currentVoltage.toFixed(2) : 0} V</Typography>
                        </Stack>
                    </Card>
                    <Card variant="outlined">
                        <Stack padding={2}>
                            <Typography variant="body1" textAlign="center">Arus</Typography>
                            <GaugeComponent
                                type="semicircle"
                                arc={{
                                    gradient: true,
                                    width: 0.25,
                                    cornerRadius: 16,
                                    subArcs: [
                                        {
                                            limit: 20,
                                            color: "RGB(20, 40, 100)"
                                        },
                                        {
                                            limit: 50,
                                            color: "RGB(100, 140, 200)"
                                        },
                                        {
                                            color: "RGB(120, 180, 220)"
                                        }
                                    ]
                                }}
                                pointer={{ type: "needle" }}
                                minValue={0}
                                maxValue={60}
                                value={(currentAmpere != null) ? currentAmpere : 0}
                                labels={{
                                    valueLabel: {
                                        formatTextValue: () => ``,
                                    },
                                    tickLabels: {
                                        hideMinMax: true
                                    }
                                }}
                            />
                            <Typography textAlign="center" variant="h6" fontWeight={600}>{(currentAmpere != null) ? currentAmpere.toFixed(2) : 0} A</Typography>
                        </Stack>
                    </Card>
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
                                            limit: 20,
                                            color: "RGB(20, 40, 100)"
                                        },
                                        {
                                            limit: 50,
                                            color: "RGB(100, 140, 200)"
                                        },
                                        {
                                            color: "RGB(120, 180, 220)"
                                        }
                                    ]
                                }}
                                pointer={{ type: "needle" }}
                                minValue={0}
                                maxValue={60}
                                value={(currentVoltage != null || currentAmpere != null) ? currentAmpere * currentVoltage : 0}
                                labels={{
                                    valueLabel: {
                                        formatTextValue: () => ``,
                                    },
                                    tickLabels: {
                                        hideMinMax: true
                                    }
                                }}
                            />
                            <Typography textAlign="center" variant="h6" fontWeight={600} color={currentAmpere * currentVoltage < 12 && "red"}>{(currentVoltage != null || currentAmpere != null) ? (currentAmpere * currentVoltage).toFixed(2) : 0} Watt</Typography>
                        </Stack>
                    </Card>
                    <Card variant="outlined">
                        <Stack padding={2}>
                            <Typography variant="body1" textAlign="center">Total daya masuk hari ini</Typography>
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
                                            limit: 150,
                                            color: "RGB(100, 140, 200)"
                                        },
                                        {
                                            color: "RGB(120, 180, 220)"
                                        }
                                    ]
                                }}
                                pointer={{ type: "needle" }}
                                minValue={0}
                                maxValue={200}
                                value={(totalPower != null) ? totalPower : 0}
                                labels={{
                                    valueLabel: {
                                        formatTextValue: () => ``,
                                    },
                                    tickLabels: {
                                        hideMinMax: true
                                    }
                                }}
                            />
                            <Typography textAlign="center" variant="h6" fontWeight={600}>{(totalPower != null) ? totalPower.toFixed(2) : 0} Wh</Typography>
                        </Stack>
                    </Card>
                </Stack>
            </Stack>
        </Stack>
    )
}