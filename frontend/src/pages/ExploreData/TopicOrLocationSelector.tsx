import React, { useRef, useState } from 'react'
import ArrowDropUp from '@mui/icons-material/ArrowDropUp'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import {
  Fips,
  USA_DISPLAY_NAME,
  USA_FIPS,
  isFipsString,
} from '../../data/utils/Fips'
import styles from './MadLibUI.module.scss'
import { usePopover } from '../../utils/hooks/usePopover'
import {
  CATEGORIES_LIST,
  DEFAULT,
  SELECTED_DROPDOWN_OVERRIDES,
  type DefaultDropdownVarId,
  DROPDOWN_TOPIC_MAP,
} from '../../utils/MadLibs'
import {
  Box,
  Grid,
  ListItemText,
  List,
  Button,
  Popover,
  Autocomplete,
  TextField,
  ListItemButton,
} from '@mui/material'
import {
  type DropdownVarId,
  type DataTypeId,
} from '../../data/config/MetricConfig'
import { usePrefersReducedMotion } from '../../utils/hooks/usePrefersReducedMotion'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { EXPLORE_DATA_PAGE_LINK } from '../../utils/internalRoutes'

interface TopicOrLocationSelectorProps {
  value: DataTypeId | string | DefaultDropdownVarId // DataTypeId OR fips as string OR default setting with no topic selected
  options: Fips[] | string[][]
  onOptionUpdate: (option: string) => void
}

export default function TopicOrLocationSelector(
  props: TopicOrLocationSelectorProps
) {
  const newValue: any | DataTypeId | string | DefaultDropdownVarId = props.value
  const isFips = isFipsString(newValue)
  let currentDisplayName
  if (isFips) {
    currentDisplayName = new Fips(newValue).getFullDisplayName()
  } else {
    const chosenOption = (props.options as string[][]).find(
      (i: string[]) => i[0] === newValue
    )
    // prefer the overrides, use normal name otherwise. fallback to empty string
    currentDisplayName =
      SELECTED_DROPDOWN_OVERRIDES?.[chosenOption?.[0] as DropdownVarId] ??
      chosenOption?.[1] ??
      ''
  }

  const popoverRef = useRef(null)
  const popover = usePopover()

  const [, setTextBoxValue] = useState('')
  const updateTextBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextBoxValue(event.target.value)
  }

  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false)
  const openAutoComplete = () => {
    setAutoCompleteOpen(true)
  }

  const closeAutoComplete = () => {
    setAutoCompleteOpen(false)
  }

  function getGroupName(option: Fips): string {
    if (option.isUsa()) return 'National'
    if (option.isState()) return 'States'
    if (option.isTerritory()) return 'Territories'
    return `${option.getParentFips().getDisplayName()} ${
      option.getParentFips().isTerritory() ? ' County Equivalents' : ' Counties'
    }`
  }

  const anchorO = 'bottom'
  const transformO = 'top'

  const noTopic = props.value === DEFAULT

  // only pulse the condition button when no topic is selected and dropdown menu is closed (and user hasn't set their machine to prefer reduced motion)
  const prefersReducedMotion = usePrefersReducedMotion()
  const doPulse = !prefersReducedMotion && !isFips && noTopic && !popover.isOpen

  const dropdownTarget = `${props.value}-dropdown-${isFips ? 'fips' : 'topic'}`

  function handleUsaButton() {
    props.onOptionUpdate(USA_FIPS)
    popover.close()
  }

  const isUsa = props.value === '00'

  return (
    <>
      <span ref={popoverRef}>
        {/* Clickable Madlib Button with Dropdown Arrow */}
        <Button
          variant='text'
          aria-haspopup='true'
          className={doPulse ? styles.MadLibButtonPulse : styles.MadLibButton}
          onClick={popover.open}
        >
          <span className={dropdownTarget}>
            {currentDisplayName}{' '}
            {popover.isOpen ? <ArrowDropUp /> : <ArrowDropDown />}
          </span>
        </Button>

        <Popover
          className={styles.PopoverOverride}
          aria-expanded='true'
          open={popover.isOpen}
          anchorEl={popover.anchor}
          onClose={popover.close}
          anchorOrigin={{
            vertical: anchorO,
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: transformO,
            horizontal: 'center',
          }}
        >
          {/* Location Dropdown */}
          {isFips && (
            <div className={styles.TopicOrLocationSelectorPopover}>
              <h3 className={styles.SearchForText}>Search for location</h3>

              <Autocomplete
                disableClearable={true}
                autoHighlight={true}
                options={props.options as Fips[]}
                groupBy={(option) => getGroupName(option)}
                clearOnEscape={true}
                getOptionLabel={(fips) => fips.getFullDisplayName()}
                isOptionEqualToValue={(fips) => fips.code === props.value}
                renderOption={(props, fips: Fips) => {
                  return <li {...props}>{fips.getFullDisplayName()}</li>
                }}
                open={autoCompleteOpen}
                onOpen={openAutoComplete}
                onClose={closeAutoComplete}
                renderInput={(params) => (
                  <TextField
                    placeholder=''
                    /* eslint-disable-next-line */
                    autoFocus
                    margin='dense'
                    variant='outlined'
                    onChange={updateTextBox}
                    {...params}
                  />
                )}
                onChange={(e, fips) => {
                  props.onOptionUpdate(fips.code)
                  setTextBoxValue('')
                  popover.close()
                }}
              />
              <span className={styles.NoteText}>
                County, state, territory, or{' '}
                {isUsa ? (
                  USA_DISPLAY_NAME
                ) : (
                  <button
                    className='cursor-pointer border-0 bg-transparent p-0 italic text-altGreen underline'
                    onClick={handleUsaButton}
                  >
                    United States
                  </button>
                )}
                . Some source data is unavailable at county and territory
                levels.
              </span>
            </div>
          )}
          {/* Condition Dropdown */}
          {!isFips && (
            <>
              <Box my={3} mx={3}>
                <Grid container>
                  {CATEGORIES_LIST.map((category) => {
                    return (
                      <Grid
                        item
                        xs={6}
                        sm={4}
                        key={category.title}
                        className={styles.CategoryList}
                      >
                        <h3
                          className={styles.CategoryTitleText}
                          aria-label={category.title + ' options'}
                        >
                          {category.title}
                        </h3>
                        <List dense={true} role='menu'>
                          {category.options.map((optionId: DropdownVarId) => {
                            return (
                              <ListItemButton
                                className={styles.ListItem}
                                key={optionId}
                                selected={optionId === props.value}
                                onClick={() => {
                                  popover.close()
                                  props.onOptionUpdate(optionId)
                                }}
                              >
                                <ListItemText
                                  className={styles.ListItemText}
                                  primary={DROPDOWN_TOPIC_MAP[optionId]}
                                />
                              </ListItemButton>
                            )
                          })}
                        </List>
                      </Grid>
                    )
                  })}
                  <Grid
                    item
                    xs={12}
                    container
                    alignItems='flex-end'
                    justifyContent='flex-end'
                  >
                    {!noTopic && (
                      <a
                        className={styles.ClearSelectionsLink}
                        href={EXPLORE_DATA_PAGE_LINK}
                      >
                        <KeyboardBackspaceIcon
                          style={{
                            fontSize: 'small',
                            paddingBottom: '3px',
                          }}
                        />{' '}
                        <span className={styles.ClearSelectionsLinkText}>
                          Clear selections
                        </span>
                      </a>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </Popover>
      </span>
    </>
  )
}
