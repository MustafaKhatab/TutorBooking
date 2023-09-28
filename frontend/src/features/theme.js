import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#14945f', // Set your desired primary color
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': {
            borderColor: '#ffffff', // Set the border color to white
          },
          '&:hover fieldset': {
            borderColor: '#14945f', // Set the hover/focus border color
          },
          '&.Mui-focused fieldset': {
            borderColor: '#14945f', // Set the focused border color
          },
          '& input': {
            color: '#ffffff', // Set the text color to white
          },
        },
      },
    },
  },
});

export default theme;
