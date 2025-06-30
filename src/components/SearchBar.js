import { TextField, IconButton, InputAdornment } from '@mui/material';
import { makeStyles } from '@mui/styles'
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

const useStyles = makeStyles((theme) => ({
  searchBar: {
    position: 'relative',
    display: 'flex',
    border: '1px solid #dfe1e5',
    borderRadius: '29px',
    boxShadow: 'none',
    maxWidth: '584px',
    minWidth: '270px',
    width: 'auto',
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    margin: '0 auto',
  },
}));

const SearchBar = (props) => {

  const { handleSearch } = props
  const [query, setQuery] = useState("")
  const classes = useStyles();

  const handleEnter = async (event) => {
    if (event.key === "Enter") {
      handleSearch(query);
    }
  }

  const handleClick = async () => {
    handleSearch(query)
  }

  return (
    <TextField
      className={classes.searchBar}
      onKeyDown={handleEnter}
      id="standard-bare"
      variant="outlined"
      placeholder="Buscar..."
      onChange={(event) => setQuery(event.target.value)}
      value={query}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton onClick={handleClick}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  )
}

export { SearchBar }