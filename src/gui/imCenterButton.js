module.exports = {
  props: {
    buttonLink: {
      default: '',
      type: String
    },
    buttonTitle: {
      default: 'WorkSprite',
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
      default: 'worksprite',
      type: String
    }
  },
  styles: [
    `.imCtrMenuSCOuter {
      position: absolute;
      border: 1px solid gray;
      border-radius: 100%; 
      background-color: rgba(31, 9, 51, 0.5);
      height: 40px; 
      width: 40px; 
    }`,
    `.imCtrMenuSCOuter:hover {
      background-color: rgba(219, 190, 137, 0.753);
      border: 2px solid goldenrod;
    }`,
    `.imCtrMenuSCInner {
      position: absolute;
      text-align: center;
      line-height: 50px;
      width: 40px;
      height: 40px;
      left: 5px;
      top: 5px;
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center; 
    }`
  ],
  data() {
    return {}
  },
  methods: {
    backgroundImage(image) {
      return { 
        'background-image': `url('${image}')`
      }
    }
},
  template: `
  <div :id='buttonId' class='imCtrMenuSCOuter' :style='buttonPos' :title='buttonTitle'>
    <div :id='iconId' class='imCtrMenuSCInner' :style='backgroundImage(iconImage)' ></div>
  </div>`
}
