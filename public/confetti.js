class Confetti {
  constructor() {
    this.duration = 2000;
    this.end = Date.now() + this.duration;
  }

  start() {
    const interval = setInterval(() => {
      if (Date.now() > this.end) {
        clearInterval(interval);
        return;
      }
      this.launch();
    }, 250);
  }

  launch() {
    const colors = ['#bb0000', '#ffffff', '#00bb00', '#0000bb', '#ffff00'];
    for (let i = 0; i < 10; i++) {
      const confetto = document.createElement('div');
      confetto.style.position = 'fixed';
      confetto.style.width = '10px';
      confetto.style.height = '10px';
      confetto.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetto.style.left = `${Math.random() * 100}%`;
      confetto.style.top = `${Math.random() * 100}px`;
      confetto.style.opacity = '1';
      confetto.style.transition = 'top 2s ease-out, opacity 2s';

      document.body.appendChild(confetto);

      setTimeout(() => {
        confetto.style.top = '100%';
        confetto.style.opacity = '0';
      }, 100);

      setTimeout(() => {
        document.body.removeChild(confetto);
      }, 2100);
    }
  }
}
