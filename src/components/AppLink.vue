<template>
  <a
    v-if="externalUrl"
    :href="externalUrl.href"
    target="_blank"
    rel="noopener noreferrer"
    class="external-link"
    ><slot
  /></a>
  <RouterLink v-else v-bind="$props" class="internal-link"><slot /></RouterLink>
</template>
<script>
import { RouterLink } from 'vue-router'

import { parseHttpUrl } from '@/utils/externalUrl.js'

export default {
  props: {
    ...RouterLink.props,
  },
  computed: {
    externalUrl() {
      return parseHttpUrl(this.to)
    },
  },
}
</script>
