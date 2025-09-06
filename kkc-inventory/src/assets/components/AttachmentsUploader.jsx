import React, { useState } from "react";
import { IconButton, Button, Box, Typography, Stack } from "@mui/material";
import { MdClose, MdDelete } from "react-icons/md";

export default function AttachmentUploader({ isDisabled, attachments, onChange }) {
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        const filteredFiles = files.filter(file => {
            if (file.size > 500 * 1024) {
            alert(`${file.name} is too large. Max size is 1MB.`);
            console.log(`${file.name} is too large. Max size is 1MB.`)
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
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
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
                                key={index}
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
                                    {file.name}
                                </Typography>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveFile(index)}
                                >
                                    <MdDelete />
                                </IconButton>
                            </Stack>
                        ))}
                    </Stack>
                )}

                <Button variant="outlined" component="label" disabled={isDisabled}>
                    Select Files
                    <input
                        hidden
                        type="file"
                        multiple
                        onChange={handleFileChange}
                    />
                </Button>
            </Box>
        </Box>
    );
}
