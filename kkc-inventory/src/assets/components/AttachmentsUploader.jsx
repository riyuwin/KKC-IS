import React from "react";
import { IconButton, Button, Box, Typography, Stack } from "@mui/material";
import { MdDelete } from "react-icons/md";

export default function AttachmentUploader({ isDisabled, attachments = [], onChange }) {
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        const filteredFiles = files.filter((file) => {
            if (file.size > 1024 * 1024) { // 1MB limit
                alert(`${file.name} is too large. Max size is 1MB.`);
                return false;
            }
            return true;
        });

        onChange([...attachments, ...filteredFiles]);
    };

    const handleRemoveFile = (index) => {
        const updated = attachments.filter((_, i) => i !== index);
        onChange(updated);
    }; 

    const handleOpenFile = (file) => { 
        if (file instanceof File) {
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, "_blank");  
        } 
        else if (file.previewUrl) {
            window.open(file.previewUrl, "_blank");  
        } 
        else if (file.file_url) {
            window.open(file.file_url, "_blank");
        }
    }; 

    const getFileName = (file) => {
        if (file instanceof File) return file.name;  
        return file.file_name || "Attachment";    
    };
 
    return (
        <Box sx={{ gridColumn: "1 / -1", mb: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                }}
            >
                {attachments.length > 0 && (
                    <Stack spacing={1} sx={{ flexGrow: 1, mr: 2 }}>
                        {attachments.map((file, index) => (
                            <Stack
                                key={file.attachment_id || index}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{ border: "1px solid #ddd", borderRadius: 1, p: 1 }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ cursor: "pointer", textDecoration: "underline" }}
                                    onClick={() => handleOpenFile(file)}
                                >
                                    {getFileName(file)}
                                </Typography>
                                {!isDisabled && (
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveFile(index)}
                                    >
                                        <MdDelete />
                                    </IconButton>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                )}

                {!isDisabled && (
                    <Button variant="outlined" component="label">
                        Select Files
                        <input hidden type="file" multiple onChange={handleFileChange} />
                    </Button>
                )}
            </Box>
        </Box>
    );
}
