// @flow

import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import PlacesAutocomplete from '../src'

class PlacesAutocompleteDemo extends React.Component<
  *,
  {
    value: string
  }
> {
  state = {
    value: ''
  }

  handleChange = (value: string) => {
    this.setState({ value })
    action('onChange')(value)
  }

  render () {
    return (
      <PlacesAutocomplete
        value={this.state.value}
        onChange={this.handleChange}
        onSelect={action('onSelect')}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps }) => (
          <div>
            <input
              {...getInputProps({
                placeholder: 'Search PlacesAutocomplete ...',
                className: 'location-search-input'
              })}
            />
            <div className='autocomplete-dropdown-container'>
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item'
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                  : { backgroundColor: '#ffffff', cursor: 'pointer' }
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    )
  }
}

storiesOf('PlacesAutocomplete', module).add('default', () => (
  <PlacesAutocompleteDemo />
))
