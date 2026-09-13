import { Box, Typography } from '@mui/material';
import styles from './auth-layout.module.css';
import { AuthLayoutProp } from './auth-layout.interface';
import Link from 'next/link';

export default function AuthLayoutComp({ title, description }: AuthLayoutProp) {
    return (
        <Box
            className={styles.container}
        >
            <Box className={styles.leftContainer}>
                <Link className={styles.title} href={'/'}>{title}</Link>
            </Box>
            <Box className={styles.rightContainer}>
                <Typography className={styles.description}>"{description}"</Typography>
            </Box>
        </Box>
    );
}