/**
 * Copyright 2020 NEM Foundation (https://nem.io)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {MosaicId, MosaicInfo, Mosaic} from 'nem2-sdk'
import {Component, Vue, Prop} from 'vue-property-decorator'
import {mapGetters} from 'vuex'

// internal dependencies
import {MosaicService} from '@/services/MosaicService'

// child components
// @ts-ignore
import AmountDisplay from '@/components/AmountDisplay/AmountDisplay.vue'

@Component({
  components: {
    AmountDisplay,
  },
  computed: {...mapGetters({
    networkMosaic: 'mosaic/networkMosaic',
    mosaicsInfo: 'mosaic/mosaicsInfoList',
    hiddenMosaics: 'mosaic/hiddenMosaics',
  })}
})
export class MosaicBalanceListTs extends Vue {

  @Prop({
    default: []
  }) mosaics: Mosaic[]

  /**
   * Networks currency mosaic
   * @var {MosaicId}
   */
  public networkMosaic: MosaicId

  /**
   * Network mosaics info (all)
   * @var {MosaicInfo[]}
   */
  public mosaicsInfo: MosaicInfo[]

  /**
   * List of mosaics that are hidden
   * @var {string[]}
   */
  public hiddenMosaics: string[]

  /**
   * Mosaic service
   * @var {MosaicService}
   */
  public mosaicService: MosaicService

  /**
   * Whether the component is in edition mode
   * @var {boolean}
   */
  public isEditionMode: boolean = false

  /**
   * Form items
   * @var {any}
   */
  public formItems: any = {
    name: '',
    hasCheckedAll: true,
    hasShowExpired: false,
  }

/// region computed properties getter/setter
  get filtered(): {info: MosaicInfo, mosaic: Mosaic}[] {
    // internal helper
    const filter = (objects) => { 
      return objects.filter(
        mosaic => -1 === this.hiddenMosaics.indexOf(mosaic.id.toHex())
      )
    }

    const info = filter(this.mosaicsInfo)
    return filter(this.mosaics).map((balanceEntry: Mosaic) => { return {
      info: info.filter(mosaic => mosaic.id.equals(balanceEntry.id)).shift(),
      mosaic: balanceEntry
    }})
  }

  get mosaicsWithInfo(): {info: MosaicInfo, mosaic: Mosaic}[] {
    const info = this.mosaicsInfo
    return this.mosaics.map((balanceEntry: Mosaic) => { return {
      info: info.filter(mosaic => mosaic.id.equals(balanceEntry.id)).shift(),
      mosaic: balanceEntry
    }})
  }
/// end-region computed properties getter/setter

  /**
   * Hook called when the component is mounted
   * @return {void}
   */
  public mounted() {
    this.mosaicService = new MosaicService(this.$store)
  }

  /**
   * Returns true when mosaic \a mosaicId is hidden
   * @param {MosaicId} mosaicId 
   * @return {boolean}
   */
  public hasHiddenMosaic(mosaicId: MosaicId): boolean {
    return 1 === this.mosaics.filter(mosaic => {
      return mosaic.id.equals(mosaicId)
          && -1 === this.hiddenMosaics.indexOf(mosaic.id.toHex())
    }).length
  }

  /**
   * Toggle whether all mosaics are shown or hidden
   * @return {void}
   */
  public toggleMosaicDisplay(mosaicId?: MosaicId) {
    // - clicked singular checkbox
    if (mosaicId !== undefined) {
      const isHidden = this.hasHiddenMosaic(mosaicId)
      const action = isHidden ? 'SHOW_MOSAIC' : 'HIDE_MOSAIC'
      return this.$store.dispatch('mosaic/' + action, mosaicId)
    }

    // - clicked "check all"
    this.formItems.hasCheckedAll = !this.formItems.hasCheckedAll

    // - update state
    const action = this.formItems.hasCheckedAll ? 'HIDE_MOSAIC' : 'SHOW_MOSAIC'
    return this.mosaics.map(
      mosaic => this.$store.dispatch('mosaic/' + action, mosaic.id))
  }
}