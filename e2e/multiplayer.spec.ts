import { expect, test, type BrowserContext, type Locator, type Page } from '@playwright/test'
import { decodeSignalEnvelope } from '../src/multiplayer/signaling'

const preparePage = async (context: BrowserContext, url: string) => {
  const page = await context.newPage()
  await page.addInitScript(() => {
    localStorage.clear()
    localStorage.setItem('logic-garden:install-prompt:v1', 'dismissed')
  })
  await page.goto(url)
  return page
}

const openGroupPlay = async (page: Page, action: 'Crear una partida' | 'Unir-m’hi') => {
  await page.getByRole('button', { name: 'Joc en grup' }).click()
  const dialog = page.locator('.competition-panel')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: action }).click()
  return dialog
}

const connectParticipant = async (masterDialog: Locator, participantDialog: Locator) => {
  await masterDialog.getByText('Veure el codi en text').click()
  const invitation = masterDialog.getByRole('textbox', {
    name: 'Invitació de partida en text',
  })
  await expect(invitation).toHaveValue(/.+/u)
  const offerSdp = decodeSignalEnvelope(await invitation.inputValue())?.description.sdp ?? ''
  expect(offerSdp).toContain('a=candidate:')

  await participantDialog.getByText('Enganxar la invitació').click()
  await participantDialog
    .getByRole('textbox', { name: 'Invitació del creador' })
    .fill(await invitation.inputValue())
  await participantDialog.getByRole('button', { name: 'Preparar resposta' }).click()
  await participantDialog.getByText('Veure el codi en text').click()
  const answer = participantDialog.getByRole('textbox', {
    name: 'Resposta al creador en text',
  })
  await expect(answer).toHaveValue(/.+/u)
  const answerSdp = decodeSignalEnvelope(await answer.inputValue())?.description.sdp ?? ''
  expect(answerSdp).toContain('a=candidate:')

  await masterDialog.getByText('Enganxar la resposta').click()
  await masterDialog
    .getByRole('textbox', { name: 'Resposta del participant' })
    .fill(await answer.inputValue())
  await masterDialog.getByRole('button', { name: 'Acceptar resposta' }).click()

  await expect(participantDialog.getByText(/participants connectats/u)).toBeVisible()
}

test('three devices connect and start the same local round', async ({
  browser,
  browserName,
}, testInfo) => {
  test.skip(
    browserName === 'webkit',
    'Playwright WebKit on Linux cannot resolve its isolated mDNS ICE host candidates.',
  )
  const contextOptions = {
    baseURL: 'http://127.0.0.1:4173/logic-garden/',
    viewport: { width: 390, height: 844 },
    locale: 'ca-ES',
  }
  const masterContext = await browser.newContext(contextOptions)
  const firstContext = await browser.newContext(contextOptions)
  const secondContext = await browser.newContext(contextOptions)
  const master = await preparePage(masterContext, 'http://127.0.0.1:4173/logic-garden/')
  const firstParticipant = await preparePage(
    firstContext,
    'http://127.0.0.1:4173/logic-garden/',
  )
  const secondParticipant = await preparePage(
    secondContext,
    'http://127.0.0.1:4173/logic-garden/',
  )

  try {
    const masterDialog = await openGroupPlay(master, 'Crear una partida')
    await masterDialog.getByRole('button', { name: 'Crear invitació' }).click()
    const firstDialog = await openGroupPlay(firstParticipant, 'Unir-m’hi')
    await connectParticipant(masterDialog, firstDialog)
    await expect(masterDialog.getByText('2 participants connectats')).toBeVisible()
    await expect(firstDialog.getByText('2 participants connectats')).toBeVisible()

    await masterDialog.getByRole('button', { name: 'Afegir participant' }).click()
    const secondDialog = await openGroupPlay(secondParticipant, 'Unir-m’hi')
    await connectParticipant(masterDialog, secondDialog)
    await expect(masterDialog.getByText('3 participants connectats')).toBeVisible()
    await expect(firstDialog.getByText('3 participants connectats')).toBeVisible()
    await expect(secondDialog.getByText('3 participants connectats')).toBeVisible()
    await expect(firstDialog.getByTestId('group-setup-summary').locator('strong')).toHaveText(
      await masterDialog.getByTestId('group-setup-summary').locator('strong').innerText(),
    )

    await firstDialog.getByRole('button', { name: 'Tancar' }).click()
    await expect(firstParticipant.getByRole('button', { name: 'Connectat · 3' })).toBeVisible()
    await expect(firstParticipant.getByText('Selecció del creador')).toBeVisible()
    await expect(firstParticipant.getByRole('radio')).toHaveCount(0)
    await firstParticipant.getByRole('button', { name: 'Connectat · 3' }).click()
    await expect(firstDialog).toBeVisible()
    await master.screenshot({
      path: testInfo.outputPath('multiplayer-lobby.png'),
      fullPage: true,
    })

    await masterDialog.getByRole('button', { name: 'Jugar amb aquesta selecció' }).click()
    await expect(master.locator('.game-screen')).toBeVisible()
    await expect(firstParticipant.locator('.game-screen')).toBeVisible()
    await expect(secondParticipant.locator('.game-screen')).toBeVisible()
    await expect(
      master.getByRole('button', { name: 'Connectat al joc en grup amb 3 participants' }),
    ).toBeVisible()
    await expect(
      firstParticipant.getByRole('button', {
        name: 'Connectat al joc en grup amb 3 participants',
      }),
    ).toBeVisible()
    await expect(
      secondParticipant.getByRole('button', {
        name: 'Connectat al joc en grup amb 3 participants',
      }),
    ).toBeVisible()
    await master.screenshot({
      path: testInfo.outputPath('multiplayer-round.png'),
      fullPage: false,
    })
    await expect(firstParticipant.locator('.adventure-banner__title h1')).toHaveText(
      await master.locator('.adventure-banner__title h1').innerText(),
    )
    await expect(secondParticipant.locator('.adventure-banner__title h1')).toHaveText(
      await master.locator('.adventure-banner__title h1').innerText(),
    )
    await expect(master.locator('.location-cell').first()).toBeVisible()
    const locationCount = await master.locator('.location-cell').count()
    expect(locationCount).toBeGreaterThan(0)
    await expect(firstParticipant.locator('.location-cell')).toHaveCount(locationCount)
    await expect(secondParticipant.locator('.location-cell')).toHaveCount(locationCount)

    await secondParticipant
      .getByRole('button', { name: 'Connectat al joc en grup amb 3 participants' })
      .click()
    const activeRoundDialog = secondParticipant.locator('.competition-panel')
    await activeRoundDialog.getByRole('button', { name: 'Desconnectar-me' }).click()
    await activeRoundDialog.getByRole('button', { name: 'Sí, desconnectar-me' }).click()
    await expect(
      master.getByRole('button', { name: 'Connectat al joc en grup amb 2 participants' }),
    ).toBeVisible()
    await expect(
      firstParticipant.getByRole('button', {
        name: 'Connectat al joc en grup amb 2 participants',
      }),
    ).toBeVisible()
    await expect(
      secondParticipant.getByRole('button', { name: /Connectat al joc en grup/u }),
    ).toHaveCount(0)

    await master
      .getByRole('button', { name: 'Connectat al joc en grup amb 2 participants' })
      .click()
    const masterActiveDialog = master.locator('.competition-panel')
    await masterActiveDialog.getByRole('button', { name: 'Tancar la sala' }).click()
    await masterActiveDialog.getByRole('button', { name: 'Sí, tancar la sala' }).click()
    await expect(
      firstParticipant.getByRole('button', {
        name: 'Connexió perduda amb el joc en grup',
      }),
    ).toBeVisible()
    await firstParticipant
      .getByRole('button', { name: 'Connexió perduda amb el joc en grup' })
      .click()
    await expect(firstParticipant.getByRole('alert')).toHaveText(
      'El creador ha tancat la sala.',
    )
  } finally {
    await masterContext.close()
    await firstContext.close()
    await secondContext.close()
  }
})
