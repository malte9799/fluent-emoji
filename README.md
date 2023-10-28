# fluent-emoji React Component

## This is a React Component that makes it easy to add fluent emojis

### Setup

```bash
npm i fluent-emoji
```

### Usage
Default type: 3d

Default color: Default (yellow)

```tsx
import { WhiteFlag, Beaver, Astronaut, Alien } from 'fluent-emoji'

export function App() {
  return
    <>
      <WhiteFlag />
      <Beaver type='Flat' />
      <Astronaut type='Color' color='medium' />
      <Alien type='Animated' />
    </>
}
```
