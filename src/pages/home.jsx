import { Box, Button, Card, CardContent, Divider, Grid, Grid2, Stack, Step, StepIcon, StepLabel, Stepper, Typography } from '@mui/material';
import { wifiAbout } from '../assets/strings'

export function PriceCardContent() {
    return (
        <CardContent>
            <Typography variant='h6' textAlign='center' fontWeight={600}>Harga Penyewaan</Typography>
            <Grid2 container padding={1}>
                <Grid2 size="grow" padding={[0, 1, 0, 1]}>
                    <Stack direction="row" spacing={2} alignItems='center' justifyContent='center'>
                        <span className='material-symbols-outlined'>
                            paid
                        </span>
                        <Typography variant='body1'>Rp. 1000</Typography>
                    </Stack>
                </Grid2>
                <Grid2>
                    <Divider orientation='vertical' />
                </Grid2>
                <Grid2 size="grow" padding={[0, 1, 0, 1]}>
                    <Stack direction="row" spacing={2} alignItems='center' justifyContent='center'>
                        <span className='material-symbols-outlined'>
                            timer
                        </span>
                        <Typography variant='body1'>30 Menit</Typography>
                    </Stack>
                </Grid2>
            </Grid2>
        </CardContent>
    )
}

function GuideCard() {
    const steps = [
        {
            label: 'Sambungkan perangkat ke jaringan Wi-Fi Koin',
            icon: 'devices'
        },
        {
            label: 'Ikuti arahan pada web login',
            icon: 'language'
        },
        {
            label: 'Nikmati layanan internet',
            icon: 'wifi'
        }
    ];

    function HorizontalLine() {
        return (
            <Box sx={{ flex: 1, height: 4, background: 'black', }} />
        )
    }

    return (
        <CardContent>
            <Stack spacing={2}>
                <Typography variant='h6' textAlign='center' fontWeight={600}>Cara Penggunaan</Typography>
                <Stack direction='row'>
                    {steps.map((element, index) => {
                        return (
                            <Stack flex={1} spacing={2}>
                                <Stack direction='row' alignItems='center'>
                                    <Box sx={{ flex: 1 }}>
                                        {(index > 0) ? <HorizontalLine /> : null}
                                    </Box>
                                    <Box sx={{
                                        width: 64, height: 64,
                                        background: 'RGB(30,30,40)',
                                        color: 'white',
                                        borderRadius: '100%',
                                        alignItems: 'center',
                                        justifyContent: "center",
                                        display: 'flex'
                                    }}>
                                        <span className='material-symbols-outlined'>{element.icon}</span>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        {(index < steps.length - 1) ? <HorizontalLine /> : null}
                                    </Box>
                                </Stack>
                                <Typography variant='body1' paddingX={1} textAlign='center'>{element.label}</Typography>
                            </Stack>
                        )
                    })}
                </Stack>
            </Stack>
        </CardContent>
    )
}

export default function Home() {
    return (
        <Stack spacing={2}>
            <Card sx={{ backgroundColor: 'RGB(30,30,40)', color: 'white' }}>
                <CardContent>
                    <Stack spacing={4} alignItems='center'>
                        <Typography variant='h4' textAlign='center'>Wi-Fi Koin</Typography>
                        <Button
                            variant='contained'
                            sx={{ maxWidth: 200 }}
                            href='/admin'
                        >
                            Login Admin
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
            <Card variant='outlined' sx={{ padding: 3 }}>
                <Typography variant='body1' textAlign='justify' >
                    {wifiAbout.replaceAll('\n', ' ')}
                </Typography>
            </Card>
            <Card variant='outlined'><PriceCardContent /></Card>
            <Card variant='outlined'
            ><GuideCard /></Card>
        </Stack>
    )
}