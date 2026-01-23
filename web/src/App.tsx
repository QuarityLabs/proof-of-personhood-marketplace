import React from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { 
  styleReset, 
  List, 
  ListItem, 
  Divider, 
  Window, 
  WindowHeader, 
  WindowContent, 
  Button,
  AppBar,
  Toolbar,
  TextField
} from 'react95';
// pick a theme of your choice
import original from 'react95/dist/themes/original';
// original Windows95 font (optionally)
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal;
  }
  body, input, select, textarea {
    font-family: 'ms_sans_serif';
  }
  ${styleReset}
`;

const App = () => {
  return (
    <ThemeProvider theme={original}>
      <GlobalStyles />
      
      {/* Desktop Background */}
      <div className="h-screen w-screen bg-[#008080] flex items-center justify-center flex-col">
        
        {/* Main Application Window */}
        <Window className="w-[400px] mb-20">
          <WindowHeader className="flex justify-between items-center">
            <span>ProofOfPersonhood.exe</span>
            <Button size="sm">
              <span className="font-bold">x</span>
            </Button>
          </WindowHeader>
          <WindowContent>
            <p className="mb-4 text-lg">Welcome to the Identity Verification Portal.</p>
            
            <div className="mb-4">
              <label>Wallet Address:</label>
              <TextField placeholder="0x..." fullWidth />
            </div>

            <div className="flex justify-between mt-4">
              <Button onClick={() => alert('Connecting...')}>Connect Wallet</Button>
              <Button active>Verify Identity</Button>
            </div>
          </WindowContent>
        </Window>

        {/* Taskbar */}
        <AppBar style={{ top: 'auto', bottom: 0 }}>
          <Toolbar className="flex justify-between">
            <div className="relative inline-block">
              <Button variant="menu" size="lg" className="font-bold">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e2/Windows_logo_and_wordmark_-_1995-2001.svg"
                  alt="Win95"
                  style={{ height: '20px', marginRight: 4 }}
                />
                Start
              </Button>
            </div>
            <div className="bg-white px-2 border-2 border-gray-400 border-inset">
              12:00 PM
            </div>
          </Toolbar>
        </AppBar>

      </div>
    </ThemeProvider>
  );
};

export default App;
