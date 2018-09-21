<template>
  <div class="tab recording-tab">
    <div class="content">
      <div class="empty" v-show="!isRecording">
        <img src="/images/Desert.svg" alt="desert" width="78px">
        <h3>No recorded events yet</h3>
        <p class="text-muted">Click record to begin</p>
      </div>
      <div class="events" v-show="isRecording">
        <p class="text-muted text-center loading" v-show="liveEvents.length === 0">Waiting for events</p>
        <ul class="event-list">
          <li v-for="(event, index) in liveEvents" :key="index" class="event-list-item">
            <div class="event-label">
              {{index + 1}}.
            </div>
            <div class="event-description">
              <div class="event-action">{{event.action}}</div>
              <div class="event-props text-muted">{{event.selector || parseEventValue(event)}}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'RecordingTab',
    props: {
      isRecording: { type: Boolean, default: false },
      liveEvents: { type: Array, default: () => { return [] } }
    },
    methods: {
      parseEventValue (event) {
        if (event.action === 'viewport*') return `width: ${event.value.width}, height: ${event.value.height}`
        if (event.action === 'goto*') return event.href
        if (event.action === 'navigation*') return ''
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import "~styles/_animations.scss";
  @import "~styles/_variables.scss";


  .recording-tab {
    .content {
      display:flex;
      flex-direction:column;
      height:100%;
      min-height: 200px;
      .empty {
        padding: $spacer;
        text-align: center;
      }

      .events {
        max-height: $max-content-height;
        flex: 1;
        height:100%;
        overflow: auto;
        display: flex;
        flex-direction: column-reverse;

        .loading:after {
          content: '.';
          animation: dots 1s steps(5, end) infinite;
          animation-delay: 1.5s;
          margin-bottom: auto;
        }

        .event-list {
          list-style-type: none;
          padding: 0;
          margin: 0;

          .event-list-item {
            padding: 12px;
            font-size: 12px;
            border-top: 1px solid $gray-light;
            display: flex;
            flex: 1 1 auto;
            height: 32px;

            .event-label {
              vertical-align: top;
              margin-right: $spacer;
            }

            .event-description {
              margin-right: auto;
              display: inline-block;

              .event-action {
                font-weight: bold;
              }

              .event-props {
                white-space: pre;
              }
            }

          }
        }
      }
    }
  }
</style>
