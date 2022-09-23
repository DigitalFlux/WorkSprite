module.exports = {
    props: {
      buttonLink: {
        default: '',
        type: String
      },
      buttonTitle: {
        default: 'test',
        type: String
      },
      buttonId: {
        default: 'testbtn',
        type: String
      },
      buttonPos: {
        default: `left: 100px; top: 100px;`,
        type: String,
        required: true
      },
      iconId: {
        default: 'testicon',
        type: String
      },
      iconImage: {
        default: '',
        type: String
      }
    },
    styles: [
      `.imMenuSCOuter {
        position: absolute;
        border: 1px solid gray;
        border-radius: 100%; 
        background-color: rgba(31, 9, 51, 0.5);
        height: 40px; 
        width: 40px; 
      }`,
      `.imMenuSCOuter:hover {
        background-color: rgba(219, 190, 137, 0.753);
        border: 2px solid goldenrod;
      }`,
      `.imMenuSCInner {
        position: absolute;
        text-align: center;
        line-height: 40px;
        width: 30px;
        height: 30px;
        left: 5px;
        top: 5px;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
      }`
    ],
    data() {
      return { 
        clickHandler: () => {
          nw.WorkSprite.guiComponents.immediateMenu.MenuButtonClicked(this.buttonLink);
        }
      }
    },
    template: `
    <div :id='buttonId' class='imMenuSCOuter' :style='buttonPos' @click='clickHandler' :title='buttonTitle'>
      <div :id='iconId' class='imMenuSCInner' ></div>
    </div>`
}
  