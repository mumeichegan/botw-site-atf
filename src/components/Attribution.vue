<template>
    <div id="attribution">
      <p>✨This web page is built for self-learning only. The intention is to apply learning to practice. 🧡 All credit and thanks to <a href="https://www.zelda.com/breath-of-the-wild/">the original work</a> by &copy; Nintendo. The Legend of Zelda is a trademark of Nintendo.</p>
    </div>
</template>

<style>
#attribution {
  position: absolute;
  z-index: 5;

  /* height: calc(100% - 44px - 66px - calc(100vh - 110px) * .9); */
  width: calc(100% - 21px);
  
  background-color: rgba(0,0,0, .375);

  bottom: calc(100% - 44px - 66px - calc(100vh - 110px) * .9 + 21px * 1.5);
  left: 50%;
  transform: translateX(-50%);
  border-radius: 3px;

  padding: 6px;
  color: #fff;
}
#attribution p {
  line-height: 1.4;
  
}
#attribution a {
  text-decoration: underline;
  color: goldenrod;
}
@media (max-width: 480px) {
  #attribution p {
    font-size: 12px;
  }
}

</style>