// @flow
import * as React from 'react'
import algoliasearch from 'algoliasearch/src/browser/builds/algoliasearchLite.js'

const placesClient = algoliasearch.initPlaces()
// placesClient.as.addAlgoliaAgent(`@terrencewwong/react-algolia-places ${version}`);

class Places extends React.Component<{
  children: ({
    getInputProps: () => {
      onChange: Function,
      value: string
    },
    getSuggestionItemProps: Function,
    suggestions: Object[]
  }) => React.Node,
  onChange: (value: string) => void,
  value: string
}, {
  suggestions: Object[],
}> {
  state = {
    suggestions: [],
  }

  getInputProps = () => {
    return {
      onChange: this.handleChange,
      value: this.props.value
    }
  }

  getSuggestionItemProps = (suggestion: Object) => {
    return {
      key: suggestion.objectID
    }
  }

  handleChange = async (e: SyntheticInputEvent<*>) => {
    const value = e.target.value
    this.props.onChange(value)

    try {
      const { hits } = await placesClient.search({
        query: value
      })
      this.setState({ suggestions: hits })
    } catch (e) {
      console.error(e)
    }
  }

  render () {
    return (
      <div>
        {
          this.props.children({
            getInputProps: this.getInputProps,
            getSuggestionItemProps: this.getSuggestionItemProps,
            suggestions: this.state.suggestions
          })
        }
      </div>
    )
  }
}
export default Places
