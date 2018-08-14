<template>
  <div class="tab recording-tab">
    <div class="content">
      <div class="empty" v-show="!isRecording">
        <img src="/images/Desert.svg" alt="desert" width="78px">
        <h3>No recorded events yet</h3>
        <p class="text-muted">Click record to begin</p>
      </div>
      <div class="events" v-show="isRecording">
        <p class="text-muted text-center" v-show="liveEvents.length === 0">Waiting for events...</p>
        <ul class="event-list">
          <li v-for="(event, index) in liveEvents" class="event-list-item">
            <div class="event-label">
              {{index + 1}}.
            </div>
            <div class="event-description">
              <div class="event-action">{{event.action}}</div>
              <div class="event-props text-muted">{{event.selector || event.href }}</div>
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
    }
  }
</script>
<style lang="scss" scoped>
  @import "~styles/_variables.scss";


  .recording-tab {
    .content {
      min-height: 200px;
      .empty {
        padding: $spacer;
        text-align: center;
      }

      .events {
        max-height: 400px;
        overflow-y: auto;

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
