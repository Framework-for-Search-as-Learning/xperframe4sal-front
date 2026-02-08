/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import Likert from 'react-likert-scale'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({

    root: {
      maxWidth: '80%',
      marginBottom: 16,
      boxShadow: "0 10px 20px 0 rgba(0,0,0,0.25)"
    }

  })

const LikertScaleForm  = (props) => {

    const classes = useStyles()

    const likertOptions = {

        responses: props.options,
        onChange: val => {
            props.onChange(props.question, Object.values(val)[1])
        }

    }

    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    {props.question}
                </Typography>
                <Likert {...likertOptions} />
            </CardContent>
        </Card>
    )

}

export { LikertScaleForm }