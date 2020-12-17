<script>

</script>

<style>
  .wrapper {
    position: absolute;
    display: grid;
    place-content: center;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 999;
  }

  .bg {
    display: flex;
    background: white;
    width: 220px;
    justify-content: center;
    align-items: center;
    padding: 1rem 2rem;
    border-radius: 0.4em;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }

  .current-day {
    font-size: 5rem;
    margin: 0;
    padding: 0;
    text-align: center;
    text-transform: uppercase;
    width: 100%;
  }

  .current-num {
    font-size: 10rem;
    margin: 0;
    padding: 0;
    line-height: 0.618;
    text-align: center;
    text-transform: uppercase;
    width: 100%;
  }

  .message-body {
    padding-block-start: 2rem;
    color: #7A7A7A;
  }
</style>

<div class="wrapper">
  <div class="bg">
    <section>
      <h1 class="message-header">Hey Cassy!</h1>
      <div class="current-day">day</div>
      <div class="current-num">5</div>
      <p class="message-body">
        You said it takes 21 days to make or break a habit. On January 4, 2021
        you will have quit smoking. We all know you can do anything you put your
        mind to.
      </p>
    </section>
  </div>
</div>
