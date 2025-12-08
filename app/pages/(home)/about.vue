<script setup lang="tsx">
definePageMeta({
  layout: 'home',
})

const value = `
Hi，这里是 <ruby>enpitsu<rp>(</rp><rt>えんぴつ</rt><rp>)</rp>lin</ruby>，你可以叫我铅笔。

> ~~rose are red, violets are blue, i'm the guy ENPITSULIN, so who the hell are you~~

90 后的尾巴，现在已经成为资深社畜，有点抽象，有点社恐，间歇性踌躇满志，持续性混吃等死。

同时总是在业余时间自己鼓捣一些玩具项目。

## 兴趣爱好

- 喜欢写代码，喜欢开源文化。
- 喜欢~~二次元（雾~~。
- 平时通过打打游戏来娱乐。

## 博客

:small{.op-50.text-xs}[🚧 这个站点还在建设中...]

- 使用 Nuxt 构建，不止分享技术，偶尔吐点槽，评价下是非，写点小心情。。
- 文章均使用 CC BY-NC-SA 许可发布，转载请署名标注来源。

## 如何找到我

全网同 ID，所以如果有什么地方见到这个 ID 那就是我咯😆 或者可以通过下面几个方式找到我：

:home-intro-links{.not-prose :excludes='["RSS"]'}
`
</script>

<template>
  <HomePageContainer
    title="关于"
  >
    <template #header>
      <MDC
        tag="article"
        class="w-full text-14px animate-delay-100 prose animate-in fade-in max-w-unset! animate-duration-800! animate-ease-$spring-easing! dark:prose-invert"
        :value="value"
      />
    </template>
  </HomePageContainer>
</template>
