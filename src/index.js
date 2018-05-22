// @flow
import React from 'react'
import algoliasearch from 'algoliasearch/src/browser/builds/algoliasearchLite.js'
import debounce from 'lodash.debounce'

import formatHit from './formatHit'
import formatInputValue from './formatInputValue'
import { compose } from './helpers'

type Suggestion = {
  active: boolean,
  description: string,
  id: string,
  index: number,
  placeId: string
}

type Props = {
  onChange: Function,
  value: string,
  children: Function,
  onError?: Function,
  onSelect?: Function,
  debounce?: number,
  highlightFirstSuggestion?: boolean,
  shouldFetchSuggestions?: boolean
}

const placesClient = algoliasearch.initPlaces()

export default class PlacesAutocomplete extends React.Component<
  Props,
  {
    ready: boolean,
    suggestions: Suggestion[],
    userInputValue: string
  }
> {
  static defaultProps = {
    searchOptions: {},
    debounce: 200,
    highlightFirstSuggestion: false,
    shouldFetchSuggestions: true
  }

  mousedownOnSuggestion: boolean = false
  debouncedFetchPredictions: Function

  constructor (props: Props) {
    super(props)

    this.state = {
      suggestions: [],
      userInputValue: props.value,
      ready: true
    }

    this.debouncedFetchPredictions = debounce(
      this.fetchPredictions,
      this.props.debounce
    )
  }

  fetchPredictions = async () => {
    const { value } = this.props
    if (value.length) {
      try {
        const content = await placesClient.search({
          hitsPerPage: 5,
          language: 'en',
          query: value
        })
        const hits = content.hits
        // TODO: expose more of this formatted information
        const formattedHits = hits.map((hit, hitIndex) =>
          formatHit({
            formatInputValue,
            hit,
            hitIndex,
            query: value,
            rawAnswer: content
          })
        )

        this.setState({
          suggestions: formattedHits.map((hit, idx) => ({
            active: this.props.highlightFirstSuggestion && idx === 0,
            description: hit.value,
            id: hit.objectID,
            index: idx,
            latlng: hit.latlng,
            placeId: hit.objectID
          }))
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  clearSuggestions = () => {
    this.setState({ suggestions: [] })
  }

  clearActive = () => {
    this.setState({
      suggestions: this.state.suggestions.map(suggestion => ({
        ...suggestion,
        active: false
      }))
    })
  }

  handleSelect = (address: string, placeId: ?string) => {
    this.clearSuggestions()
    this.props.onChange(address)
    this.props.onSelect && this.props.onSelect(address, placeId)
  }

  getActiveSuggestion = () => {
    return this.state.suggestions.find(suggestion => suggestion.active)
  }

  selectActiveAtIndex = (index: number) => {
    const activeSuggestion = this.state.suggestions.find(
      suggestion => suggestion.index === index
    )

    if (!activeSuggestion) {
      throw Error('No active description')
    }

    const activeName = activeSuggestion.description
    this.setActiveAtIndex(index)
    this.props.onChange(activeName)
  }

  selectUserInputValue = () => {
    this.clearActive()
    this.props.onChange(this.state.userInputValue)
  }

  handleEnterKey = () => {
    const activeSuggestion = this.getActiveSuggestion()
    if (activeSuggestion === undefined) {
      this.handleSelect(this.props.value, null)
    } else {
      this.handleSelect(activeSuggestion.description, activeSuggestion.placeId)
    }
  }

  handleDownKey = () => {
    if (this.state.suggestions.length === 0) {
      return
    }

    const activeSuggestion = this.getActiveSuggestion()
    if (activeSuggestion === undefined) {
      this.selectActiveAtIndex(0)
    } else if (activeSuggestion.index === this.state.suggestions.length - 1) {
      this.selectUserInputValue()
    } else {
      this.selectActiveAtIndex(activeSuggestion.index + 1)
    }
  }

  handleUpKey = () => {
    if (this.state.suggestions.length === 0) {
      return
    }

    const activeSuggestion = this.getActiveSuggestion()
    if (activeSuggestion === undefined) {
      this.selectActiveAtIndex(this.state.suggestions.length - 1)
    } else if (activeSuggestion.index === 0) {
      this.selectUserInputValue()
    } else {
      this.selectActiveAtIndex(activeSuggestion.index - 1)
    }
  }

  handleInputKeyDown = (event: SyntheticKeyboardEvent<*>) => {
    /* eslint-disable indent */
    switch (event.key) {
      case 'Enter':
        event.preventDefault()
        this.handleEnterKey()
        break
      case 'ArrowDown':
        event.preventDefault() // prevent the cursor from moving
        this.handleDownKey()
        break
      case 'ArrowUp':
        event.preventDefault() // prevent the cursor from moving
        this.handleUpKey()
        break
      case 'Escape':
        this.clearSuggestions()
        break
    }
    /* eslint-enable indent */
  }

  setActiveAtIndex = (index: number) => {
    this.setState({
      suggestions: this.state.suggestions.map((suggestion, idx) => {
        if (idx === index) {
          return { ...suggestion, active: true }
        } else {
          return { ...suggestion, active: false }
        }
      })
    })
  }

  handleInputChange = (event: SyntheticInputEvent<*>) => {
    const { value } = event.target
    this.props.onChange(value)
    this.setState({ userInputValue: value })
    if (!value) {
      this.clearSuggestions()
      return
    }
    if (this.props.shouldFetchSuggestions) {
      this.debouncedFetchPredictions()
    }
  }

  handleInputOnBlur = () => {
    if (!this.mousedownOnSuggestion) {
      this.clearSuggestions()
    }
  }

  getActiveSuggestionId = () => {
    const activeSuggestion = this.getActiveSuggestion()
    return activeSuggestion
      ? `PlacesAutocomplete__suggestion-${activeSuggestion.placeId}`
      : null
  }

  getIsExpanded = () => {
    return this.state.suggestions.length > 0
  }

  getInputProps = (options: Object = {}) => {
    if (options.hasOwnProperty('value')) {
      throw new Error(
        '[react-places-autocomplete]: getInputProps does not accept `value`. Use `value` prop instead'
      )
    }

    if (options.hasOwnProperty('onChange')) {
      throw new Error(
        '[react-places-autocomplete]: getInputProps does not accept `onChange`. Use `onChange` prop instead'
      )
    }

    const defaultInputProps = {
      type: 'text',
      autoComplete: 'off',
      role: 'combobox',
      'aria-autocomplete': 'list',
      'aria-expanded': this.getIsExpanded(),
      'aria-activedescendant': this.getActiveSuggestionId(),
      disabled: !this.state.ready
    }

    return {
      ...defaultInputProps,
      ...options,
      onKeyDown: compose(this.handleInputKeyDown, options.onKeyDown),
      onBlur: compose(this.handleInputOnBlur, options.onBlur),
      value: this.props.value,
      onChange: (event: SyntheticInputEvent<*>) => {
        this.handleInputChange(event)
      }
    }
  }

  getSuggestionItemProps = (suggestion: Suggestion, options: Object = {}) => {
    const handleSuggestionMouseEnter = this.handleSuggestionMouseEnter.bind(
      this,
      suggestion.index
    )
    const handleSuggestionClick = this.handleSuggestionClick.bind(
      this,
      suggestion
    )

    return {
      ...options,
      key: suggestion.id,
      id: this.getActiveSuggestionId(),
      role: 'option',
      onMouseEnter: compose(handleSuggestionMouseEnter, options.onMouseEnter),
      onMouseLeave: compose(
        this.handleSuggestionMouseLeave,
        options.onMouseLeave
      ),
      onMouseDown: compose(this.handleSuggestionMouseDown, options.onMouseDown),
      onMouseUp: compose(this.handleSuggestionMouseUp, options.onMouseUp),
      onTouchStart: compose(
        this.handleSuggestionTouchStart,
        options.onTouchStart
      ),
      onTouchEnd: compose(this.handleSuggestionMouseUp, options.onTouchEnd),
      onClick: compose(handleSuggestionClick, options.onClick)
    }
  }

  handleSuggestionMouseEnter = (index: number) => {
    this.setActiveAtIndex(index)
  }

  handleSuggestionMouseLeave = () => {
    this.mousedownOnSuggestion = false
    this.clearActive()
  }

  handleSuggestionMouseDown = (event: SyntheticMouseEvent<*>) => {
    event.preventDefault()
    this.mousedownOnSuggestion = true
  }

  handleSuggestionTouchStart = () => {
    this.mousedownOnSuggestion = true
  }

  handleSuggestionMouseUp = () => {
    this.mousedownOnSuggestion = false
  }

  handleSuggestionClick = (
    suggestion: Suggestion,
    event: SyntheticEvent<*>
  ) => {
    if (event && event.preventDefault) {
      event.preventDefault()
    }
    const { description, placeId } = suggestion
    this.handleSelect(description, placeId)
    setTimeout(() => {
      this.mousedownOnSuggestion = false
    })
  }

  render () {
    return this.props.children({
      getInputProps: this.getInputProps,
      getSuggestionItemProps: this.getSuggestionItemProps,
      suggestions: this.state.suggestions
    })
  }
}
