import { Box, CircularProgress, Container, TextField, Typography, Link } from '@mui/material'
import './App.css'
import axios from 'axios';
import { useState } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import ReplyIcon from '@mui/icons-material/Reply';

function App() {

	const [emailContent, setEmailContent] = useState('');
	const [tone, setTone] = useState('');
	const [generatedReply, setGeneratedReply] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await axios.post('http://localhost:8080/api/email/generate', {
				emailContent,
				tone,
			});
			setGeneratedReply(typeof response.data === 'string' ?
				response.data : JSON.stringify(response.data)
			);
		} catch (error) {
			console.error('Error generating reply:', error);
		} finally {
			setLoading(false);
		}

	}

	return (
		<Box className="app-container">
			<Container maxWidth="md">
				{/* Header */}
				<Box className="app-header">
					<Typography className="app-title" variant="h3" component="h1">
						Email Reply Generator
					</Typography>
					<Typography className="app-subtitle">
						Craft perfect email responses with AI-powered assistance
					</Typography>
				</Box>

				{/* Main Card */}
				<Box className="glass-card">
					{/* Input Section */}
					<Box sx={{ mb: 3 }}>
						<Typography className="section-label">
							<EmailIcon className="icon" fontSize="small" />
							Original Email
						</Typography>
						<TextField
							fullWidth
							multiline
							rows={6}
							variant='outlined'
							placeholder="Paste the email you want to reply to..."
							value={emailContent || ''}
							onChange={(e) => setEmailContent(e.target.value)}
						/>
					</Box>

					{/* Tone Selection */}
					<Box sx={{ mb: 3 }}>
						<Typography className="section-label">
							Select Tone
						</Typography>
						<FormControl fullWidth>
							<InputLabel>Choose a tone (Optional)</InputLabel>
							<Select
								value={tone || ''}
								label="Choose a tone (Optional)"
								onChange={(e) => setTone(e.target.value)}
							>
								<MenuItem value="">None</MenuItem>
								<MenuItem value="professional">💼 Professional</MenuItem>
								<MenuItem value="casual">😊 Casual</MenuItem>
								<MenuItem value="friendly">🤝 Friendly</MenuItem>
							</Select>
						</FormControl>
					</Box>

					{/* Generate Button */}
					<Button
						className="primary-btn"
						variant="contained"
						fullWidth
						onClick={handleSubmit}
						disabled={!emailContent || loading}
						endIcon={!loading && <SendIcon />}
					>
						{loading ? <CircularProgress size={24} color="inherit" /> : "Generate Reply"}
					</Button>

					{/* Generated Reply Section */}
					{generatedReply && (
						<Box sx={{ mt: 4 }}>
							<Typography className="section-label">
								<ReplyIcon className="icon" fontSize="small" />
								Generated Reply
							</Typography>
							<TextField
								fullWidth
								multiline
								rows={6}
								variant='outlined'
								value={generatedReply}
								InputProps={{ readOnly: true }}
								sx={{ mb: 2 }}
							/>
							<Button
								className="secondary-btn"
								variant="outlined"
								startIcon={<ContentCopyIcon />}
								onClick={() => navigator.clipboard.writeText(generatedReply)}
							>
								Copy to Clipboard
							</Button>
						</Box>
					)}
				</Box>

				{/* Footer */}
				<Box className="app-footer">
					<Typography className="footer-content">
						Made with <span className="heart">❤️</span> by{' '}
						<Link
							href="https://github.com/Bhavya1904"
							target="_blank"
							rel="noopener noreferrer"
						>
							Bhavya
						</Link>
					</Typography>
				</Box>
			</Container>
		</Box>
	)
}

export default App
