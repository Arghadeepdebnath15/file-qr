import React, { useEffect, useState } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    Typography,
    CircularProgress,
    Paper,
} from '@mui/material';
import { API_ENDPOINTS, makeApiRequest } from '../config/api';

interface File {
    _id: string;
    originalName: string;
    url: string;
    uploadDate: string;
    size: number;
}

const ReceivedFiles: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFiles = async () => {
        try {
            const data = await makeApiRequest(API_ENDPOINTS.RECENT_FILES);
            setFiles(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
        const interval = setInterval(fetchFiles, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (files.length === 0) {
        return (
            <Box p={3}>
                <Typography color="textSecondary">
                    No files have been uploaded yet.
                </Typography>
            </Box>
        );
    }

    return (
        <Paper elevation={2}>
            <List>
                {files.map((file) => (
                    <ListItem
                        key={file._id}
                        button
                        component="a"
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        divider
                    >
                        <ListItemText
                            primary={file.originalName}
                            secondary={new Date(file.uploadDate).toLocaleString()}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default ReceivedFiles; 